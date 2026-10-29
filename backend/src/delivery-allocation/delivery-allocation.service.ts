import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, MoreThan, Repository } from 'typeorm';
import { DeliveryPartner } from '../delivery-partners/entities/delivery-partner.entity';
import { DeliveryRequest } from './entities/delivery-request.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderStatus } from '../orders/enums/order-status.enum';
import { calculateHaversineDistance } from '../common/utils/geo.util';
import {
  BROADCAST_DISPATCH_WINDOW_SECONDS,
  DEFAULT_MAX_CONCURRENT_ORDERS,
  DISPATCH_COUNTDOWN_SECONDS,
  EXPANDED_DISPATCH_RADIUS_KM,
  GPS_STALE_THRESHOLD_MINUTES,
  INITIAL_DISPATCH_RADIUS_KM,
  MAX_DISPATCH_ATTEMPTS,
  MAX_SERIAL_DISPATCH_ATTEMPTS,
} from '../delivery-partners/delivery-partner.constants';
import { DeliveryRequestStatus, DispatchStage } from './enums/delivery-request.enum';

export interface CandidateCourier {
  partner: DeliveryPartner;
  distanceKm: number;
}

@Injectable()
export class DeliveryAllocationService {
  private readonly logger = new Logger(DeliveryAllocationService.name);

  constructor(
    @InjectRepository(DeliveryPartner)
    private readonly deliveryPartnerRepository: Repository<DeliveryPartner>,
    @InjectRepository(DeliveryRequest)
    private readonly deliveryRequestRepository: Repository<DeliveryRequest>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Discovers online, verified couriers within radiusKm, filtered by
   * active order concurrency and GPS freshness, ranked closest-first.
   */
  async findEligibleCandidates(
    pickupLat: number,
    pickupLng: number,
    radiusKm: number,
    excludedPartnerIds: number[] = [],
  ): Promise<CandidateCourier[]> {
    const candidates = await this.deliveryPartnerRepository.find({
      where: {
        isOnline: true,
        isVerified: true,
      },
      relations: { user: true },
    });

    const now = Date.now();
    const staleThresholdMs = GPS_STALE_THRESHOLD_MINUTES * 60 * 1000;

    const qualified = candidates.filter((partner) => {
      // 1. Order concurrency check (< 2 active orders)
      if (partner.activeOrderCount >= DEFAULT_MAX_CONCURRENT_ORDERS) {
        return false;
      }

      // 2. Exclude couriers who previously declined this order cycle
      if (excludedPartnerIds.includes(partner.id)) {
        return false;
      }

      // 3. Must have valid GPS coordinates
      if (
        partner.latitude === null ||
        partner.latitude === undefined ||
        partner.longitude === null ||
        partner.longitude === undefined
      ) {
        return false;
      }

      // 4. Ghost courier check: GPS ping must be fresher than 5 minutes
      if (!partner.lastLocationUpdatedAt) {
        return false;
      }
      const lastUpdateMs = new Date(partner.lastLocationUpdatedAt).getTime();
      if (now - lastUpdateMs > staleThresholdMs) {
        return false;
      }

      return true;
    });

    // 5. Calculate Haversine distance using global helper & filter within radius
    const withinRadius: CandidateCourier[] = [];
    for (const partner of qualified) {
      const distanceKm = calculateHaversineDistance(
        pickupLat,
        pickupLng,
        partner.latitude!,
        partner.longitude!,
      );
      if (distanceKm <= radiusKm) {
        withinRadius.push({ partner, distanceKm });
      }
    }

    // 6. Rank candidates: closest driver first
    withinRadius.sort((a, b) => a.distanceKm - b.distanceKm);

    this.logger.log(
      `Found ${withinRadius.length} eligible courier(s) within ${radiusKm}km of pickup location (${pickupLat}, ${pickupLng})`,
    );

    return withinRadius;
  }

  /**
   * Initiates dispatch matching for an order.
   * Offers the order to the closest eligible courier within 5km (or 10km expanded).
   */
  async dispatchOrder(orderId: number): Promise<DeliveryRequest | null> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: { merchant: true, outlet: true },
    });

    if (!order) {
      throw new NotFoundException(`Order #${orderId} not found`);
    }

    // 1. Guard: Check if order is already assigned
    if (order.deliveryPartnerId !== null && order.deliveryPartnerId !== undefined) {
      this.logger.log(`Order #${orderId} is already assigned to courier #${order.deliveryPartnerId}`);
      return null;
    }

    // 2. Guard: Pickup coordinates must exist (outlet branch coordinates take precedence over merchant master coords)
    const pickupLat = order.outlet?.latitude ?? order.merchant?.latitude;
    const pickupLng = order.outlet?.longitude ?? order.merchant?.longitude;

    if (
      pickupLat === null ||
      pickupLat === undefined ||
      pickupLng === null ||
      pickupLng === undefined
    ) {
      throw new BadRequestException(`Merchant location coordinates missing for order #${orderId}`);
    }

    // 3. Guard: Do not duplicate if an active PENDING request already exists
    const existingPending = await this.deliveryRequestRepository.findOne({
      where: { orderId, status: DeliveryRequestStatus.PENDING },
    });
    if (existingPending) {
      return existingPending;
    }

    // 4. Discover eligible candidates (start at 5km, expand to 10km if needed) anchored to physical pickup origin
    let candidates = await this.findEligibleCandidates(
      pickupLat,
      pickupLng,
      INITIAL_DISPATCH_RADIUS_KM,
    );

    if (candidates.length === 0) {
      this.logger.log(
        `No couriers within ${INITIAL_DISPATCH_RADIUS_KM}km. Expanding search to ${EXPANDED_DISPATCH_RADIUS_KM}km for order #${orderId}`,
      );
      candidates = await this.findEligibleCandidates(
        pickupLat,
        pickupLng,
        EXPANDED_DISPATCH_RADIUS_KM,
      );
    }

    if (candidates.length === 0) {
      this.logger.warn(
        `Zero eligible couriers found within ${EXPANDED_DISPATCH_RADIUS_KM}km for order #${orderId}`,
      );
      return null;
    }

    // 5. Select closest candidate (rank #1) and set 20s countdown
    const primaryCandidate = candidates[0];
    const expiresAt = new Date(Date.now() + DISPATCH_COUNTDOWN_SECONDS * 1000);

    const deliveryRequest = this.deliveryRequestRepository.create({
      orderId,
      deliveryPartnerId: primaryCandidate.partner.id,
      status: DeliveryRequestStatus.PENDING,
      stage: DispatchStage.SERIAL,
      attemptNumber: 1,
      distanceKm: primaryCandidate.distanceKm,
      estimatedPayout: order.deliveryFee,
      expiresAt,
    });

    const savedRequest = await this.deliveryRequestRepository.save(deliveryRequest);
    this.logger.log(
      `Dispatched order #${orderId} to closest courier #${primaryCandidate.partner.id} (${primaryCandidate.distanceKm}km away, expires at ${expiresAt.toISOString()})`,
    );

    return savedRequest;
  }

  /**
   * Cascades an unaccepted or declined order to the next available courier.
   * Handles Stage 1 (top 8 serial offers) and transitions to Stage 2 (Open Radar Broadcast).
   */
  async cascadeNextDispatch(orderId: number): Promise<DeliveryRequest | null> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: { merchant: true, outlet: true },
    });

    if (!order) {
      throw new NotFoundException(`Order #${orderId} not found`);
    }

    // 1. Guard: If order was claimed or cancelled, abort cascade
    if (order.deliveryPartnerId !== null && order.deliveryPartnerId !== undefined) {
      this.logger.log(`Order #${orderId} is already assigned; skipping cascade`);
      return null;
    }

    // Pickup coordinates must exist (outlet branch coordinates take precedence over merchant master coords)
    const pickupLat = order.outlet?.latitude ?? order.merchant?.latitude;
    const pickupLng = order.outlet?.longitude ?? order.merchant?.longitude;

    if (
      pickupLat === null ||
      pickupLat === undefined ||
      pickupLng === null ||
      pickupLng === undefined
    ) {
      throw new BadRequestException(
        `Merchant location coordinates missing for order #${orderId}`,
      );
    }

    // 2. Fetch all previous requests for this order
    const previousRequests = await this.deliveryRequestRepository.find({
      where: { orderId },
    });

    // Collect previously attempted driver IDs to avoid spamming the same courier
    const attemptedPartnerIds = previousRequests
      .map((r) => r.deliveryPartnerId)
      .filter((id): id is number => typeof id === 'number');

    const attemptNumber = previousRequests.length + 1;

    // 3. Stage 1: Serial 1-by-1 offers (attempts 1 to 8)
    if (attemptNumber <= MAX_SERIAL_DISPATCH_ATTEMPTS) {
      let candidates = await this.findEligibleCandidates(
        pickupLat,
        pickupLng,
        INITIAL_DISPATCH_RADIUS_KM,
        attemptedPartnerIds,
      );

      if (candidates.length === 0) {
        candidates = await this.findEligibleCandidates(
          pickupLat,
          pickupLng,
          EXPANDED_DISPATCH_RADIUS_KM,
          attemptedPartnerIds,
        );
      }

      if (candidates.length > 0) {
        const nextCandidate = candidates[0];
        const expiresAt = new Date(Date.now() + DISPATCH_COUNTDOWN_SECONDS * 1000);

        const request = this.deliveryRequestRepository.create({
          orderId,
          deliveryPartnerId: nextCandidate.partner.id,
          status: DeliveryRequestStatus.PENDING,
          stage: DispatchStage.SERIAL,
          attemptNumber,
          distanceKm: nextCandidate.distanceKm,
          estimatedPayout: order.deliveryFee,
          expiresAt,
        });

        const saved = await this.deliveryRequestRepository.save(request);
        this.logger.log(
          `Cascaded order #${orderId} (attempt #${attemptNumber}) to courier #${nextCandidate.partner.id}`,
        );
        return saved;
      }
    }

    // 4. Stage 2: Open Broadcast Radar (attempts 9 to 50)
    if (attemptNumber <= MAX_DISPATCH_ATTEMPTS) {
      this.logger.log(
        `Transitioning order #${orderId} to Stage 2: Open Broadcast Radar (attempt #${attemptNumber})`,
      );
      const expiresAt = new Date(
        Date.now() + BROADCAST_DISPATCH_WINDOW_SECONDS * 1000,
      );

      const broadcastRequest = this.deliveryRequestRepository.create({
        orderId,
        deliveryPartnerId: null as any, // Open to all eligible couriers in pool
        status: DeliveryRequestStatus.PENDING,
        stage: DispatchStage.BROADCAST,
        attemptNumber,
        distanceKm: 0,
        estimatedPayout: order.deliveryFee,
        expiresAt,
      });

      const saved = await this.deliveryRequestRepository.save(broadcastRequest);
      return saved;
    }

    // 5. Total Exhaustion Escalation (> 50 attempts)
    this.logger.warn(
      `[UNASSIGNED_ESCALATION] Order #${orderId} reached ${attemptNumber} attempts without courier assignment. Escalating to merchant dashboard.`,
    );
    return null;
  }

  /**
   * Handles courier rejection of a delivery offer.
   * Marks request REJECTED and immediately triggers cascade to the next candidate.
   */
  async handleRejection(
    requestId: number,
    partnerId: number,
  ): Promise<DeliveryRequest | null> {
    const request = await this.deliveryRequestRepository.findOne({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException(`Delivery request #${requestId} not found`);
    }

    if (request.status !== DeliveryRequestStatus.PENDING) {
      throw new BadRequestException(
        `Cannot reject request with status ${request.status}`,
      );
    }

    // In serial stage, verify courier assignment
    if (
      request.stage === DispatchStage.SERIAL &&
      request.deliveryPartnerId !== partnerId
    ) {
      throw new BadRequestException(
        `Courier #${partnerId} is not assigned to serial request #${requestId}`,
      );
    }

    request.status = DeliveryRequestStatus.REJECTED;
    request.respondedAt = new Date();
    await this.deliveryRequestRepository.save(request);

    this.logger.log(
      `Courier #${partnerId} rejected request #${requestId} for order #${request.orderId}. Triggering cascade...`,
    );

    // Immediately cascade to the next candidate
    return await this.cascadeNextDispatch(request.orderId);
  }

  /**
   * Accepts a delivery request for a courier.
   * Atomically locks and validates request, courier concurrency, and order assignment.
   * Cancels any competing pending requests for the same order.
   */
  async acceptDeliveryRequest(
    requestId: number,
    partnerId: number,
  ): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      // 1. Pessimistic lock on DeliveryRequest
      const request = await manager.getRepository(DeliveryRequest).findOne({
        where: { id: requestId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!request) {
        throw new NotFoundException(`Delivery request #${requestId} not found`);
      }

      if (request.status !== DeliveryRequestStatus.PENDING) {
        throw new ConflictException(
          `Delivery request #${requestId} is no longer pending (current: ${request.status})`,
        );
      }

      // Check expiration
      if (new Date() > new Date(request.expiresAt)) {
        request.status = DeliveryRequestStatus.EXPIRED;
        await manager.getRepository(DeliveryRequest).save(request);
        throw new ConflictException(
          `Delivery request #${requestId} has expired`,
        );
      }

      // In serial stage, courier must match the assigned deliveryPartnerId
      if (
        request.stage === DispatchStage.SERIAL &&
        request.deliveryPartnerId !== partnerId
      ) {
        throw new BadRequestException(
          `Delivery request #${requestId} was not offered to courier #${partnerId}`,
        );
      }

      // 2. Pessimistic lock on DeliveryPartner
      const partner = await manager.getRepository(DeliveryPartner).findOne({
        where: { id: partnerId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!partner) {
        throw new NotFoundException(`Delivery partner #${partnerId} not found`);
      }

      if (!partner.isOnline) {
        throw new BadRequestException(
          `Delivery partner #${partnerId} is currently offline`,
        );
      }

      if (partner.activeOrderCount >= DEFAULT_MAX_CONCURRENT_ORDERS) {
        throw new ConflictException(
          `Delivery partner #${partnerId} has reached maximum concurrent orders (${DEFAULT_MAX_CONCURRENT_ORDERS})`,
        );
      }

      // 3. Pessimistic lock on Order
      const order = await manager.getRepository(Order).findOne({
        where: { id: request.orderId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!order) {
        throw new NotFoundException(`Order #${request.orderId} not found`);
      }

      if (
        order.deliveryPartnerId !== null &&
        order.deliveryPartnerId !== undefined
      ) {
        throw new ConflictException(
          `Order #${order.id} is already assigned to courier #${order.deliveryPartnerId}`,
        );
      }

      if (order.status === OrderStatus.CANCELLED) {
        throw new ConflictException(`Order #${order.id} has been cancelled`);
      }

      // 4. Update DeliveryRequest
      request.status = DeliveryRequestStatus.ACCEPTED;
      request.deliveryPartnerId = partner.id;
      request.respondedAt = new Date();
      await manager.getRepository(DeliveryRequest).save(request);

      // 5. Increment courier active orders
      partner.activeOrderCount += 1;
      await manager.getRepository(DeliveryPartner).save(partner);

      // 6. Assign order to courier
      order.deliveryPartnerId = partner.id;
      const savedOrder = await manager.getRepository(Order).save(order);

      // 7. Cancel competing pending requests for this order
      await manager
        .getRepository(DeliveryRequest)
        .createQueryBuilder()
        .update(DeliveryRequest)
        .set({ status: DeliveryRequestStatus.CANCELLED })
        .where('orderId = :orderId AND id != :requestId AND status = :status', {
          orderId: order.id,
          requestId: request.id,
          status: DeliveryRequestStatus.PENDING,
        })
        .execute();

      this.logger.log(
        `Courier #${partner.id} accepted request #${request.id} for order #${order.id}. Active orders: ${partner.activeOrderCount}`,
      );

      return savedOrder;
    });
  }

  /**
   * Retrieves the current active serial delivery offer for a specific courier.
   * If the offer has passed its expiresAt countdown, it transitions to EXPIRED
   * and triggers the cascade for the next courier.
   */
  async getIncomingOffer(partnerId: number): Promise<DeliveryRequest | null> {
    const request = await this.deliveryRequestRepository.findOne({
      where: {
        deliveryPartnerId: partnerId,
        stage: DispatchStage.SERIAL,
        status: DeliveryRequestStatus.PENDING,
      },
      relations: {
        order: {
          merchant: true,
          outlet: true,
          items: true,
        },
      },
      order: { createdAt: 'DESC' },
    });

    if (!request) {
      return null;
    }

    // Check if the 20s countdown has expired
    if (new Date() > new Date(request.expiresAt)) {
      request.status = DeliveryRequestStatus.EXPIRED;
      await this.deliveryRequestRepository.save(request);

      this.logger.log(
        `Incoming offer #${request.id} for courier #${partnerId} expired. Triggering cascade...`,
      );

      // Trigger cascade to the next candidate
      this.cascadeNextDispatch(request.orderId).catch((err) => {
        this.logger.error(
          `Error cascading expired offer #${request.id}: ${err.message}`,
          err.stack,
        );
      });

      return null;
    }

    return request;
  }

  /**
   * Retrieves active Stage 2 (Open Radar Broadcast) offers within proximity of the courier.
   * Filters by courier online status, order capacity (< 2), radius, and prior rejections.
   */
  async getRadarOffers(partnerId: number): Promise<DeliveryRequest[]> {
    const partner = await this.deliveryPartnerRepository.findOne({
      where: { id: partnerId },
    });

    if (!partner || !partner.isOnline || !partner.isVerified) {
      return [];
    }

    if (partner.activeOrderCount >= DEFAULT_MAX_CONCURRENT_ORDERS) {
      return [];
    }

    if (
      partner.latitude === null ||
      partner.latitude === undefined ||
      partner.longitude === null ||
      partner.longitude === undefined
    ) {
      return [];
    }

    // Find all active broadcast requests that have not expired
    const activeBroadcasts = await this.deliveryRequestRepository.find({
      where: {
        stage: DispatchStage.BROADCAST,
        status: DeliveryRequestStatus.PENDING,
        expiresAt: MoreThan(new Date()),
      },
      relations: {
        order: {
          merchant: true,
          outlet: true,
          items: true,
        },
      },
      order: { createdAt: 'DESC' },
    });

    if (activeBroadcasts.length === 0) {
      return [];
    }

    // Find all orders that this courier previously rejected to prevent offering them again
    const previousRejections = await this.deliveryRequestRepository.find({
      where: {
        deliveryPartnerId: partner.id,
        status: DeliveryRequestStatus.REJECTED,
      },
      select: { orderId: true },
    });
    const rejectedOrderIds = new Set(previousRejections.map((r) => r.orderId));

    const eligibleOffers: DeliveryRequest[] = [];

    for (const request of activeBroadcasts) {
      // Skip if courier previously rejected this order
      if (rejectedOrderIds.has(request.orderId)) {
        continue;
      }

      const pickupLat =
        request.order?.outlet?.latitude ?? request.order?.merchant?.latitude;
      const pickupLng =
        request.order?.outlet?.longitude ?? request.order?.merchant?.longitude;

      if (
        pickupLat === null ||
        pickupLat === undefined ||
        pickupLng === null ||
        pickupLng === undefined
      ) {
        continue;
      }

      const distanceKm = calculateHaversineDistance(
        pickupLat,
        pickupLng,
        partner.latitude,
        partner.longitude,
      );

      if (distanceKm <= EXPANDED_DISPATCH_RADIUS_KM) {
        request.distanceKm = Math.round(distanceKm * 100) / 100;
        eligibleOffers.push(request);
      }
    }

    // Sort closest first
    eligibleOffers.sort((a, b) => a.distanceKm - b.distanceKm);

    return eligibleOffers;
  }

  /**
   * Sweeps expired PENDING delivery requests using SKIP LOCKED row-level locking.
   * Marks requests as EXPIRED and automatically triggers cascadeNextDispatch for affected orders.
   *
   * @returns The count of expired requests swept in this iteration.
   */
  async sweepExpiredRequests(): Promise<number> {
    const expiredRequests = await this.dataSource.transaction(
      async (manager) => {
        const requests = await manager
          .getRepository(DeliveryRequest)
          .createQueryBuilder('req')
          .setLock('pessimistic_write')
          .setOnLocked('skip_locked')
          .where('req.status = :status', {
            status: DeliveryRequestStatus.PENDING,
          })
          .andWhere('req.expiresAt <= :now', { now: new Date() })
          .limit(20)
          .getMany();

        if (requests.length === 0) {
          return [];
        }

        for (const req of requests) {
          req.status = DeliveryRequestStatus.EXPIRED;
        }

        await manager.getRepository(DeliveryRequest).save(requests);
        return requests;
      },
    );

    if (expiredRequests.length === 0) {
      return 0;
    }

    this.logger.log(
      `Swept ${expiredRequests.length} expired delivery request(s). Triggering cascade...`,
    );

    // Collect unique order IDs to avoid duplicate cascades in the same sweep cycle
    const orderIdsToCascade = Array.from(
      new Set(expiredRequests.map((r) => r.orderId)),
    );

    for (const orderId of orderIdsToCascade) {
      try {
        await this.cascadeNextDispatch(orderId);
      } catch (err: any) {
        this.logger.error(
          `Failed to cascade expired order #${orderId}: ${err.message}`,
          err.stack,
        );
      }
    }

    return expiredRequests.length;
  }
}




