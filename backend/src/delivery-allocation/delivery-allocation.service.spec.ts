import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ConflictException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import {
  DeliveryAllocationService,
  CandidateCourier,
} from './delivery-allocation.service';
import { DeliveryPartner } from '../delivery-partners/entities/delivery-partner.entity';
import { DeliveryRequest } from './entities/delivery-request.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderStatus } from '../orders/enums/order-status.enum';
import {
  DeliveryRequestStatus,
  DispatchStage,
} from './enums/delivery-request.enum';
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
import { calculateHaversineDistance } from '../common/utils/geo.util';

describe('DeliveryAllocationService', () => {
  let service: DeliveryAllocationService;
  let deliveryPartnerRepository: jest.Mocked<Repository<DeliveryPartner>>;
  let deliveryRequestRepository: jest.Mocked<Repository<DeliveryRequest>>;
  let orderRepository: jest.Mocked<Repository<Order>>;
  let dataSource: jest.Mocked<DataSource>;

  // Transaction-level repository mocks for EntityManager
  let mockTxDeliveryPartnerRepo: {
    findOne: jest.Mock;
    save: jest.Mock;
  };
  let mockTxDeliveryRequestRepo: {
    findOne: jest.Mock;
    save: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let mockTxOrderRepo: {
    findOne: jest.Mock;
    save: jest.Mock;
  };
  let mockTxQueryBuilder: any;
  let mockEntityManager: {
    getRepository: jest.Mock;
  };

  // Base Merchant Coordinates (Karachi reference point)
  const MERCHANT_LAT = 24.8607;
  const MERCHANT_LNG = 67.0011;

  const mockMerchant = {
    id: 10,
    shopName: 'Al-Barakah Halal Butchery',
    latitude: MERCHANT_LAT,
    longitude: MERCHANT_LNG,
  };

  const createMockOrder = (overrides?: Partial<Order>): Order =>
    ({
      id: 100,
      customerId: 1,
      merchantId: 10,
      deliveryPartnerId: undefined,
      status: OrderStatus.PLACED,
      subtotal: 75.0,
      deliveryFee: 15.0,
      platformFee: 2.5,
      total: 92.5,
      deliveryAddress: 'Clifton Block 2, Karachi',
      deliveryLatitude: 24.815,
      deliveryLongitude: 67.03,
      distanceKm: 4.5,
      deliveryOtp: '4821',
      items: [],
      merchant: { ...mockMerchant } as any,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    } as Order);

  const createMockPartner = (overrides?: Partial<DeliveryPartner>): DeliveryPartner =>
    ({
      id: 1,
      user: { id: 101, email: 'courier1@lahm.com' } as any,
      isOnline: true,
      isVerified: true,
      activeOrderCount: 0,
      latitude: 24.861, // ~0.05 km from merchant
      longitude: 67.0015,
      lastLocationUpdatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    } as DeliveryPartner);

  const createMockRequest = (overrides?: Partial<DeliveryRequest>): DeliveryRequest =>
    ({
      id: 501,
      orderId: 100,
      deliveryPartnerId: 1,
      status: DeliveryRequestStatus.PENDING,
      stage: DispatchStage.SERIAL,
      attemptNumber: 1,
      distanceKm: 0.5,
      estimatedPayout: 15.0,
      expiresAt: new Date(Date.now() + DISPATCH_COUNTDOWN_SECONDS * 1000),
      respondedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    } as DeliveryRequest);

  beforeEach(async () => {
    mockTxQueryBuilder = {
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      setLock: jest.fn().mockReturnThis(),
      setOnLocked: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ affected: 1 }),
      getMany: jest.fn().mockResolvedValue([]),
    };

    mockTxDeliveryRequestRepo = {
      findOne: jest.fn(),
      save: jest.fn().mockImplementation(async (req) => req),
      createQueryBuilder: jest.fn().mockReturnValue(mockTxQueryBuilder),
    };

    mockTxDeliveryPartnerRepo = {
      findOne: jest.fn(),
      save: jest.fn().mockImplementation(async (p) => p),
    };

    mockTxOrderRepo = {
      findOne: jest.fn(),
      save: jest.fn().mockImplementation(async (o) => o),
    };

    mockEntityManager = {
      getRepository: jest.fn().mockImplementation((entityClass) => {
        if (entityClass === DeliveryRequest) return mockTxDeliveryRequestRepo;
        if (entityClass === DeliveryPartner) return mockTxDeliveryPartnerRepo;
        if (entityClass === Order) return mockTxOrderRepo;
        throw new Error(`Unexpected entityClass: ${entityClass?.name}`);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveryAllocationService,
        {
          provide: getRepositoryToken(DeliveryPartner),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(DeliveryRequest),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn().mockImplementation((dto) => ({ ...dto })),
            save: jest.fn().mockImplementation(async (req) => ({
              ...req,
              id: req.id || 501,
            })),
          },
        },
        {
          provide: getRepositoryToken(Order),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest
              .fn()
              .mockImplementation(async (cb: (em: any) => Promise<any>) =>
                cb(mockEntityManager),
              ),
          },
        },
      ],
    }).compile();

    service = module.get<DeliveryAllocationService>(DeliveryAllocationService);
    deliveryPartnerRepository = module.get(getRepositoryToken(DeliveryPartner));
    deliveryRequestRepository = module.get(getRepositoryToken(DeliveryRequest));
    orderRepository = module.get(getRepositoryToken(Order));
    dataSource = module.get<DataSource>(DataSource) as jest.Mocked<DataSource>;

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // =========================================================================
  // 1. findEligibleCandidates
  // =========================================================================
  describe('findEligibleCandidates', () => {
    it('should query only online and verified delivery partners with user relation', async () => {
      deliveryPartnerRepository.find.mockResolvedValue([]);

      await service.findEligibleCandidates(MERCHANT_LAT, MERCHANT_LNG, INITIAL_DISPATCH_RADIUS_KM);

      expect(deliveryPartnerRepository.find).toHaveBeenCalledWith({
        where: { isOnline: true, isVerified: true },
        relations: { user: true },
      });
    });

    it('should calculate Haversine distances and rank candidates closest-first', async () => {
      // 3 couriers at different distances:
      // Courier 1: ~0.05 km
      // Courier 2: ~4.5 km (lat: 24.89, lng: 67.03)
      // Courier 3: ~1.4 km (lat: 24.87, lng: 67.01)
      const p1 = createMockPartner({ id: 1, latitude: 24.861, longitude: 67.0015 });
      const p2 = createMockPartner({ id: 2, latitude: 24.89, longitude: 67.03 });
      const p3 = createMockPartner({ id: 3, latitude: 24.87, longitude: 67.01 });

      deliveryPartnerRepository.find.mockResolvedValue([p2, p1, p3]);

      const results = await service.findEligibleCandidates(
        MERCHANT_LAT,
        MERCHANT_LNG,
        INITIAL_DISPATCH_RADIUS_KM,
      );

      expect(results).toHaveLength(3);
      expect(results[0].partner.id).toBe(1); // Closest (~0.1km)
      expect(results[1].partner.id).toBe(3); // Middle (~1.4km)
      expect(results[2].partner.id).toBe(2); // Farthest within 5km (~4.5km)
      expect(results[0].distanceKm).toBeLessThan(results[1].distanceKm);
      expect(results[1].distanceKm).toBeLessThan(results[2].distanceKm);
    });

    it('should filter out couriers outside the specified radius', async () => {
      const pNearby = createMockPartner({ id: 1, latitude: 24.87, longitude: 67.01 }); // ~1.4 km
      const pFar = createMockPartner({ id: 2, latitude: 24.95, longitude: 67.12 }); // ~15 km

      deliveryPartnerRepository.find.mockResolvedValue([pNearby, pFar]);

      const results = await service.findEligibleCandidates(
        MERCHANT_LAT,
        MERCHANT_LNG,
        INITIAL_DISPATCH_RADIUS_KM, // 5km
      );

      expect(results).toHaveLength(1);
      expect(results[0].partner.id).toBe(1);
    });

    it('should filter out couriers reaching or exceeding active order concurrency cap (>= 2)', async () => {
      const pWith0 = createMockPartner({ id: 1, activeOrderCount: 0 });
      const pWith1 = createMockPartner({ id: 2, activeOrderCount: 1 });
      const pWith2 = createMockPartner({ id: 3, activeOrderCount: 2 });
      const pWith3 = createMockPartner({ id: 4, activeOrderCount: 3 });

      deliveryPartnerRepository.find.mockResolvedValue([pWith0, pWith1, pWith2, pWith3]);

      const results = await service.findEligibleCandidates(
        MERCHANT_LAT,
        MERCHANT_LNG,
        INITIAL_DISPATCH_RADIUS_KM,
      );

      const returnedIds = results.map((r) => r.partner.id);
      expect(returnedIds).toContain(1);
      expect(returnedIds).toContain(2);
      expect(returnedIds).not.toContain(3);
      expect(returnedIds).not.toContain(4);
    });

    it('should filter out couriers in excludedPartnerIds (prior rejections)', async () => {
      const p1 = createMockPartner({ id: 10 });
      const p2 = createMockPartner({ id: 20 });
      const p3 = createMockPartner({ id: 30 });

      deliveryPartnerRepository.find.mockResolvedValue([p1, p2, p3]);

      const results = await service.findEligibleCandidates(
        MERCHANT_LAT,
        MERCHANT_LNG,
        INITIAL_DISPATCH_RADIUS_KM,
        [10, 30], // Couriers 10 and 30 previously rejected
      );

      expect(results).toHaveLength(1);
      expect(results[0].partner.id).toBe(20);
    });

    it('should exclude couriers with missing/null/undefined GPS coordinates', async () => {
      const pValid = createMockPartner({ id: 1, latitude: 24.861, longitude: 67.0015 });
      const pNullLat = createMockPartner({ id: 2, latitude: null as any, longitude: 67.0015 });
      const pUndefLat = createMockPartner({ id: 3, latitude: undefined, longitude: 67.0015 });
      const pNullLng = createMockPartner({ id: 4, latitude: 24.861, longitude: null as any });
      const pUndefLng = createMockPartner({ id: 5, latitude: 24.861, longitude: undefined });

      deliveryPartnerRepository.find.mockResolvedValue([
        pValid,
        pNullLat,
        pUndefLat,
        pNullLng,
        pUndefLng,
      ]);

      const results = await service.findEligibleCandidates(
        MERCHANT_LAT,
        MERCHANT_LNG,
        INITIAL_DISPATCH_RADIUS_KM,
      );

      expect(results).toHaveLength(1);
      expect(results[0].partner.id).toBe(1);
    });

    it('should exclude ghost couriers whose GPS ping is stale (> 5 minutes)', async () => {
      jest.useFakeTimers();
      const fixedNow = 1700000000000;
      jest.setSystemTime(fixedNow);

      const pFresh = createMockPartner({
        id: 1,
        lastLocationUpdatedAt: new Date(fixedNow - 2 * 60 * 1000), // 2 mins ago
      });
      const pBoundary = createMockPartner({
        id: 2,
        lastLocationUpdatedAt: new Date(fixedNow - GPS_STALE_THRESHOLD_MINUTES * 60 * 1000), // Exactly 5 mins
      });
      const pStale = createMockPartner({
        id: 3,
        lastLocationUpdatedAt: new Date(fixedNow - (GPS_STALE_THRESHOLD_MINUTES * 60 * 1000 + 1000)), // 5 mins 1 sec
      });
      const pNoPing = createMockPartner({
        id: 4,
        lastLocationUpdatedAt: undefined,
      });

      deliveryPartnerRepository.find.mockResolvedValue([pFresh, pBoundary, pStale, pNoPing]);

      const results = await service.findEligibleCandidates(
        MERCHANT_LAT,
        MERCHANT_LNG,
        INITIAL_DISPATCH_RADIUS_KM,
      );

      const returnedIds = results.map((r) => r.partner.id);
      expect(returnedIds).toContain(1); // Fresh
      expect(returnedIds).toContain(2); // Exactly 5m (not > 5m)
      expect(returnedIds).not.toContain(3); // Stale (5m 1s)
      expect(returnedIds).not.toContain(4); // No timestamp

      jest.useRealTimers();
    });

    it('should return an empty array if no partners meet all eligibility criteria', async () => {
      deliveryPartnerRepository.find.mockResolvedValue([
        createMockPartner({ id: 1, activeOrderCount: 2 }), // Max orders
        createMockPartner({ id: 2, latitude: null as any }), // Missing GPS
      ]);

      const results = await service.findEligibleCandidates(
        MERCHANT_LAT,
        MERCHANT_LNG,
        INITIAL_DISPATCH_RADIUS_KM,
      );

      expect(results).toEqual([]);
    });
  });

  // =========================================================================
  // 2. dispatchOrder
  // =========================================================================
  describe('dispatchOrder', () => {
    it('should throw NotFoundException if order does not exist', async () => {
      orderRepository.findOne.mockResolvedValue(null);

      await expect(service.dispatchOrder(999)).rejects.toThrow(
        new NotFoundException('Order #999 not found'),
      );
    });

    it('should return null and not dispatch if order is already assigned to a courier', async () => {
      const assignedOrder = createMockOrder({ id: 100, deliveryPartnerId: 42 });
      orderRepository.findOne.mockResolvedValue(assignedOrder);

      const result = await service.dispatchOrder(100);

      expect(result).toBeNull();
      expect(deliveryRequestRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if merchant location coordinates are missing', async () => {
      const orderNoLat = createMockOrder({
        id: 100,
        merchant: { id: 10, latitude: null, longitude: 67.0 } as any,
      });
      orderRepository.findOne.mockResolvedValue(orderNoLat);

      await expect(service.dispatchOrder(100)).rejects.toThrow(
        new BadRequestException('Merchant location coordinates missing for order #100'),
      );

      const orderNoLng = createMockOrder({
        id: 101,
        merchant: { id: 10, latitude: 24.8, longitude: undefined } as any,
      });
      orderRepository.findOne.mockResolvedValue(orderNoLng);

      await expect(service.dispatchOrder(101)).rejects.toThrow(
        new BadRequestException('Merchant location coordinates missing for order #101'),
      );
    });

    it('should return existing pending request without creating a duplicate', async () => {
      const order = createMockOrder({ id: 100 });
      const existingPending = createMockRequest({ id: 999, orderId: 100 });
      orderRepository.findOne.mockResolvedValue(order);
      deliveryRequestRepository.findOne.mockResolvedValue(existingPending);

      const result = await service.dispatchOrder(100);

      expect(result).toBe(existingPending);
      expect(deliveryPartnerRepository.find).not.toHaveBeenCalled();
      expect(deliveryRequestRepository.create).not.toHaveBeenCalled();
    });

    it('should dispatch to closest eligible courier within 5km with 20s countdown timer', async () => {
      const order = createMockOrder({ id: 100, deliveryFee: 18.5 });
      orderRepository.findOne.mockResolvedValue(order);
      deliveryRequestRepository.findOne.mockResolvedValue(null);

      const p1 = createMockPartner({ id: 1, latitude: 24.861, longitude: 67.0015 });
      const p2 = createMockPartner({ id: 2, latitude: 24.87, longitude: 67.01 });
      deliveryPartnerRepository.find.mockResolvedValue([p2, p1]); // p1 is closer

      const startTime = Date.now();
      const result = await service.dispatchOrder(100);

      expect(deliveryRequestRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: 100,
          deliveryPartnerId: 1, // Selected closest
          status: DeliveryRequestStatus.PENDING,
          stage: DispatchStage.SERIAL,
          attemptNumber: 1,
          estimatedPayout: 18.5,
        }),
      );

      expect(result).toBeDefined();
      const createCall = deliveryRequestRepository.create.mock.calls[0][0] as any;
      const expiresAtMs = new Date(createCall.expiresAt).getTime();
      expect(expiresAtMs).toBeGreaterThanOrEqual(
        startTime + (DISPATCH_COUNTDOWN_SECONDS - 1) * 1000,
      );
      expect(expiresAtMs).toBeLessThanOrEqual(
        startTime + (DISPATCH_COUNTDOWN_SECONDS + 2) * 1000,
      );
      expect(deliveryRequestRepository.save).toHaveBeenCalled();
    });

    it('should expand search to 10km when zero couriers found within initial 5km radius', async () => {
      const order = createMockOrder({ id: 100, deliveryFee: 22.0 });
      orderRepository.findOne.mockResolvedValue(order);
      deliveryRequestRepository.findOne.mockResolvedValue(null);

      // Courier is at ~7.6 km (outside 5km, within 10km)
      const pExpanded = createMockPartner({
        id: 5,
        latitude: 24.91,
        longitude: 67.05,
      });

      deliveryPartnerRepository.find.mockResolvedValue([pExpanded]);

      const result = await service.dispatchOrder(100);

      expect(result).toBeDefined();
      expect(deliveryRequestRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: 100,
          deliveryPartnerId: 5,
          stage: DispatchStage.SERIAL,
          attemptNumber: 1,
          estimatedPayout: 22.0,
        }),
      );
    });

    it('should return null if zero eligible couriers are found even within expanded 10km radius', async () => {
      const order = createMockOrder({ id: 100 });
      orderRepository.findOne.mockResolvedValue(order);
      deliveryRequestRepository.findOne.mockResolvedValue(null);
      deliveryPartnerRepository.find.mockResolvedValue([]); // No couriers at all

      const result = await service.dispatchOrder(100);

      expect(result).toBeNull();
      expect(deliveryRequestRepository.create).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // 3. cascadeNextDispatch
  // =========================================================================
  describe('cascadeNextDispatch', () => {
    it('should throw NotFoundException if order does not exist', async () => {
      orderRepository.findOne.mockResolvedValue(null);

      await expect(service.cascadeNextDispatch(999)).rejects.toThrow(
        new NotFoundException('Order #999 not found'),
      );
    });

    it('should return null if order is already assigned to a courier', async () => {
      const claimedOrder = createMockOrder({ id: 100, deliveryPartnerId: 5 });
      orderRepository.findOne.mockResolvedValue(claimedOrder);

      const result = await service.cascadeNextDispatch(100);

      expect(result).toBeNull();
      expect(deliveryRequestRepository.find).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if merchant coordinates are missing', async () => {
      const orderNoCoords = createMockOrder({
        id: 100,
        merchant: { id: 10, latitude: null, longitude: null } as any,
      });
      orderRepository.findOne.mockResolvedValue(orderNoCoords);

      await expect(service.cascadeNextDispatch(100)).rejects.toThrow(
        new BadRequestException('Merchant location coordinates missing for order #100'),
      );
    });

    it('should handle Stage 1 serial dispatch (attempts 1 to 8) and exclude previously attempted couriers', async () => {
      const order = createMockOrder({ id: 100, deliveryFee: 16.0 });
      orderRepository.findOne.mockResolvedValue(order);

      // Previous attempts for partners 1 and 2
      const prevRequests = [
        createMockRequest({ id: 501, orderId: 100, deliveryPartnerId: 1, attemptNumber: 1 }),
        createMockRequest({ id: 502, orderId: 100, deliveryPartnerId: 2, attemptNumber: 2 }),
      ];
      deliveryRequestRepository.find.mockResolvedValue(prevRequests);

      // Candidates in pool: 1, 2, 3. Courier 3 should be chosen
      const p1 = createMockPartner({ id: 1, latitude: 24.861, longitude: 67.0015 });
      const p2 = createMockPartner({ id: 2, latitude: 24.862, longitude: 67.002 });
      const p3 = createMockPartner({ id: 3, latitude: 24.87, longitude: 67.01 });
      deliveryPartnerRepository.find.mockResolvedValue([p1, p2, p3]);

      const result = await service.cascadeNextDispatch(100);

      expect(deliveryRequestRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: 100,
          deliveryPartnerId: 3, // Next candidate (1 and 2 excluded)
          status: DeliveryRequestStatus.PENDING,
          stage: DispatchStage.SERIAL,
          attemptNumber: 3, // 2 previous + 1
          estimatedPayout: 16.0,
        }),
      );
      expect(result).toBeDefined();
    });

    it('should expand to 10km if no couriers available within 5km during Stage 1 serial cascade', async () => {
      const order = createMockOrder({ id: 100 });
      orderRepository.findOne.mockResolvedValue(order);

      deliveryRequestRepository.find.mockResolvedValue([
        createMockRequest({ id: 501, orderId: 100, deliveryPartnerId: 1, attemptNumber: 1 }),
      ]);

      // Courier 7 is at ~7.6 km away
      const pFar = createMockPartner({ id: 7, latitude: 24.91, longitude: 67.05 });
      deliveryPartnerRepository.find.mockResolvedValue([pFar]);

      const result = await service.cascadeNextDispatch(100);

      expect(deliveryRequestRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: 100,
          deliveryPartnerId: 7,
          stage: DispatchStage.SERIAL,
          attemptNumber: 2,
        }),
      );
      expect(result).toBeDefined();
    });

    it('should transition early to Stage 2 Broadcast if no candidates remain in Stage 1 pool', async () => {
      const order = createMockOrder({ id: 100, deliveryFee: 19.0 });
      orderRepository.findOne.mockResolvedValue(order);

      // 3 previous attempts, but now no online couriers left in pool
      deliveryRequestRepository.find.mockResolvedValue([
        createMockRequest({ id: 501, orderId: 100, deliveryPartnerId: 1, attemptNumber: 1 }),
        createMockRequest({ id: 502, orderId: 100, deliveryPartnerId: 2, attemptNumber: 2 }),
        createMockRequest({ id: 503, orderId: 100, deliveryPartnerId: 3, attemptNumber: 3 }),
      ]);
      deliveryPartnerRepository.find.mockResolvedValue([]); // No candidates found

      const startTime = Date.now();
      const result = await service.cascadeNextDispatch(100);

      expect(deliveryRequestRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: 100,
          deliveryPartnerId: null, // Open to all
          status: DeliveryRequestStatus.PENDING,
          stage: DispatchStage.BROADCAST,
          attemptNumber: 4,
          distanceKm: 0,
          estimatedPayout: 19.0,
        }),
      );

      const createCall = deliveryRequestRepository.create.mock.calls[0][0] as any;
      const expiresAtMs = new Date(createCall.expiresAt).getTime();
      expect(expiresAtMs).toBeGreaterThanOrEqual(
        startTime + (BROADCAST_DISPATCH_WINDOW_SECONDS - 1) * 1000,
      );
      expect(result).toBeDefined();
    });

    it('should trigger Stage 2 Open Broadcast Radar when serial attempts are exhausted (attempts 9 to 50)', async () => {
      const order = createMockOrder({ id: 100, deliveryFee: 25.0 });
      orderRepository.findOne.mockResolvedValue(order);

      // Exactly 8 previous attempts
      const prev8 = Array.from({ length: 8 }, (_, i) =>
        createMockRequest({
          id: 500 + i + 1,
          orderId: 100,
          deliveryPartnerId: i + 1,
          attemptNumber: i + 1,
        }),
      );
      deliveryRequestRepository.find.mockResolvedValue(prev8);

      const result = await service.cascadeNextDispatch(100);

      expect(deliveryRequestRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: 100,
          deliveryPartnerId: null,
          status: DeliveryRequestStatus.PENDING,
          stage: DispatchStage.BROADCAST,
          attemptNumber: 9, // Stage 2 starts at attempt 9
          distanceKm: 0,
          estimatedPayout: 25.0,
        }),
      );
      expect(result).toBeDefined();
    });

    it('should escalate to merchant and return null when dispatch attempts exceed MAX_DISPATCH_ATTEMPTS (> 50)', async () => {
      const order = createMockOrder({ id: 100 });
      orderRepository.findOne.mockResolvedValue(order);

      // 50 previous requests
      const prev50 = Array.from({ length: MAX_DISPATCH_ATTEMPTS }, (_, i) =>
        createMockRequest({
          id: 500 + i + 1,
          orderId: 100,
          deliveryPartnerId: i + 1,
          attemptNumber: i + 1,
        }),
      );
      deliveryRequestRepository.find.mockResolvedValue(prev50);

      const result = await service.cascadeNextDispatch(100);

      expect(result).toBeNull();
      expect(deliveryRequestRepository.create).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // 4. handleRejection
  // =========================================================================
  describe('handleRejection', () => {
    it('should throw NotFoundException if delivery request does not exist', async () => {
      deliveryRequestRepository.findOne.mockResolvedValue(null);

      await expect(service.handleRejection(999, 1)).rejects.toThrow(
        new NotFoundException('Delivery request #999 not found'),
      );
    });

    it('should throw BadRequestException if delivery request status is not PENDING', async () => {
      const acceptedRequest = createMockRequest({
        id: 501,
        status: DeliveryRequestStatus.ACCEPTED,
      });
      deliveryRequestRepository.findOne.mockResolvedValue(acceptedRequest);

      await expect(service.handleRejection(501, 1)).rejects.toThrow(
        new BadRequestException('Cannot reject request with status ACCEPTED'),
      );

      const expiredRequest = createMockRequest({
        id: 502,
        status: DeliveryRequestStatus.EXPIRED,
      });
      deliveryRequestRepository.findOne.mockResolvedValue(expiredRequest);

      await expect(service.handleRejection(502, 1)).rejects.toThrow(
        new BadRequestException('Cannot reject request with status EXPIRED'),
      );
    });

    it('should throw BadRequestException if courier rejects a serial request not assigned to them', async () => {
      const serialRequest = createMockRequest({
        id: 501,
        deliveryPartnerId: 1, // Assigned to courier 1
        stage: DispatchStage.SERIAL,
        status: DeliveryRequestStatus.PENDING,
      });
      deliveryRequestRepository.findOne.mockResolvedValue(serialRequest);

      // Courier 2 tries to reject
      await expect(service.handleRejection(501, 2)).rejects.toThrow(
        new BadRequestException('Courier #2 is not assigned to serial request #501'),
      );
    });

    it('should allow rejection without partner mismatch error in Stage 2 BROADCAST stage', async () => {
      const broadcastRequest = createMockRequest({
        id: 505,
        orderId: 100,
        deliveryPartnerId: null as any,
        stage: DispatchStage.BROADCAST,
        status: DeliveryRequestStatus.PENDING,
      });
      deliveryRequestRepository.findOne.mockResolvedValue(broadcastRequest);

      jest.spyOn(service, 'cascadeNextDispatch').mockResolvedValue(null);

      const result = await service.handleRejection(505, 99);

      expect(broadcastRequest.status).toBe(DeliveryRequestStatus.REJECTED);
      expect(broadcastRequest.respondedAt).toBeInstanceOf(Date);
      expect(deliveryRequestRepository.save).toHaveBeenCalledWith(broadcastRequest);
      expect(service.cascadeNextDispatch).toHaveBeenCalledWith(100);
      expect(result).toBeNull();
    });

    it('should update request to REJECTED, record respondedAt, and immediately trigger cascadeNextDispatch', async () => {
      const request = createMockRequest({
        id: 501,
        orderId: 100,
        deliveryPartnerId: 1,
        stage: DispatchStage.SERIAL,
        status: DeliveryRequestStatus.PENDING,
      });
      deliveryRequestRepository.findOne.mockResolvedValue(request);

      const cascadedRequest = createMockRequest({
        id: 502,
        orderId: 100,
        deliveryPartnerId: 2,
        attemptNumber: 2,
      });
      jest.spyOn(service, 'cascadeNextDispatch').mockResolvedValue(cascadedRequest);

      const result = await service.handleRejection(501, 1);

      expect(request.status).toBe(DeliveryRequestStatus.REJECTED);
      expect(request.respondedAt).toBeInstanceOf(Date);
      expect(deliveryRequestRepository.save).toHaveBeenCalledWith(request);
      expect(service.cascadeNextDispatch).toHaveBeenCalledWith(100);
      expect(result).toBe(cascadedRequest);
    });
  });

  // =========================================================================
  // 5. acceptDeliveryRequest
  // =========================================================================
  describe('acceptDeliveryRequest', () => {
    it('should throw NotFoundException if delivery request does not exist inside transaction', async () => {
      mockTxDeliveryRequestRepo.findOne!.mockResolvedValue(null);

      await expect(service.acceptDeliveryRequest(999, 1)).rejects.toThrow(
        new NotFoundException('Delivery request #999 not found'),
      );
      expect(mockTxDeliveryRequestRepo.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
        lock: { mode: 'pessimistic_write' },
      });
    });

    it('should throw ConflictException if delivery request is no longer PENDING (e.g. already accepted)', async () => {
      const request = createMockRequest({
        id: 501,
        status: DeliveryRequestStatus.ACCEPTED,
      });
      mockTxDeliveryRequestRepo.findOne!.mockResolvedValue(request);

      await expect(service.acceptDeliveryRequest(501, 1)).rejects.toThrow(
        new ConflictException('Delivery request #501 is no longer pending (current: ACCEPTED)'),
      );
    });

    it('should mark request EXPIRED and throw ConflictException if request timer has expired', async () => {
      const expiredRequest = createMockRequest({
        id: 501,
        status: DeliveryRequestStatus.PENDING,
        expiresAt: new Date(Date.now() - 5000), // 5 seconds in the past
      });
      mockTxDeliveryRequestRepo.findOne!.mockResolvedValue(expiredRequest);

      await expect(service.acceptDeliveryRequest(501, 1)).rejects.toThrow(
        new ConflictException('Delivery request #501 has expired'),
      );
      expect(expiredRequest.status).toBe(DeliveryRequestStatus.EXPIRED);
      expect(mockTxDeliveryRequestRepo.save).toHaveBeenCalledWith(expiredRequest);
    });

    it('should throw BadRequestException if serial request was offered to a different courier', async () => {
      const request = createMockRequest({
        id: 501,
        deliveryPartnerId: 1, // Offered to courier 1
        stage: DispatchStage.SERIAL,
        status: DeliveryRequestStatus.PENDING,
        expiresAt: new Date(Date.now() + 10000),
      });
      mockTxDeliveryRequestRepo.findOne!.mockResolvedValue(request);

      // Courier 2 attempts to accept
      await expect(service.acceptDeliveryRequest(501, 2)).rejects.toThrow(
        new BadRequestException('Delivery request #501 was not offered to courier #2'),
      );
    });

    it('should throw NotFoundException if delivery partner does not exist', async () => {
      const request = createMockRequest({ id: 501, deliveryPartnerId: 1 });
      mockTxDeliveryRequestRepo.findOne!.mockResolvedValue(request);
      mockTxDeliveryPartnerRepo.findOne!.mockResolvedValue(null);

      await expect(service.acceptDeliveryRequest(501, 1)).rejects.toThrow(
        new NotFoundException('Delivery partner #1 not found'),
      );
      expect(mockTxDeliveryPartnerRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        lock: { mode: 'pessimistic_write' },
      });
    });

    it('should throw BadRequestException if delivery partner is offline', async () => {
      const request = createMockRequest({ id: 501, deliveryPartnerId: 1 });
      const offlinePartner = createMockPartner({ id: 1, isOnline: false });
      mockTxDeliveryRequestRepo.findOne!.mockResolvedValue(request);
      mockTxDeliveryPartnerRepo.findOne!.mockResolvedValue(offlinePartner);

      await expect(service.acceptDeliveryRequest(501, 1)).rejects.toThrow(
        new BadRequestException('Delivery partner #1 is currently offline'),
      );
    });

    it('should throw ConflictException if delivery partner has reached maximum concurrent orders (>= 2)', async () => {
      const request = createMockRequest({ id: 501, deliveryPartnerId: 1 });
      const busyPartner = createMockPartner({
        id: 1,
        isOnline: true,
        activeOrderCount: DEFAULT_MAX_CONCURRENT_ORDERS, // 2
      });
      mockTxDeliveryRequestRepo.findOne!.mockResolvedValue(request);
      mockTxDeliveryPartnerRepo.findOne!.mockResolvedValue(busyPartner);

      await expect(service.acceptDeliveryRequest(501, 1)).rejects.toThrow(
        new ConflictException(
          `Delivery partner #1 has reached maximum concurrent orders (${DEFAULT_MAX_CONCURRENT_ORDERS})`,
        ),
      );
    });

    it('should throw NotFoundException if order does not exist', async () => {
      const request = createMockRequest({ id: 501, orderId: 100, deliveryPartnerId: 1 });
      const partner = createMockPartner({ id: 1, activeOrderCount: 0 });
      mockTxDeliveryRequestRepo.findOne!.mockResolvedValue(request);
      mockTxDeliveryPartnerRepo.findOne!.mockResolvedValue(partner);
      mockTxOrderRepo.findOne!.mockResolvedValue(null);

      await expect(service.acceptDeliveryRequest(501, 1)).rejects.toThrow(
        new NotFoundException('Order #100 not found'),
      );
    });

    it('should throw ConflictException if order is already assigned to another courier', async () => {
      const request = createMockRequest({ id: 501, orderId: 100, deliveryPartnerId: 1 });
      const partner = createMockPartner({ id: 1, activeOrderCount: 0 });
      const claimedOrder = createMockOrder({ id: 100, deliveryPartnerId: 99 });
      mockTxDeliveryRequestRepo.findOne!.mockResolvedValue(request);
      mockTxDeliveryPartnerRepo.findOne!.mockResolvedValue(partner);
      mockTxOrderRepo.findOne!.mockResolvedValue(claimedOrder);

      await expect(service.acceptDeliveryRequest(501, 1)).rejects.toThrow(
        new ConflictException('Order #100 is already assigned to courier #99'),
      );
    });

    it('should throw ConflictException if order has been cancelled', async () => {
      const request = createMockRequest({ id: 501, orderId: 100, deliveryPartnerId: 1 });
      const partner = createMockPartner({ id: 1, activeOrderCount: 0 });
      const cancelledOrder = createMockOrder({
        id: 100,
        status: OrderStatus.CANCELLED,
      });
      mockTxDeliveryRequestRepo.findOne!.mockResolvedValue(request);
      mockTxDeliveryPartnerRepo.findOne!.mockResolvedValue(partner);
      mockTxOrderRepo.findOne!.mockResolvedValue(cancelledOrder);

      await expect(service.acceptDeliveryRequest(501, 1)).rejects.toThrow(
        new ConflictException('Order #100 has been cancelled'),
      );
    });

    it('should atomically accept request, increment courier active orders, assign order, and cancel competing requests', async () => {
      const request = createMockRequest({
        id: 501,
        orderId: 100,
        deliveryPartnerId: 1,
        stage: DispatchStage.SERIAL,
        status: DeliveryRequestStatus.PENDING,
      });
      const partner = createMockPartner({ id: 1, activeOrderCount: 1 });
      const order = createMockOrder({ id: 100, deliveryPartnerId: undefined });

      mockTxDeliveryRequestRepo.findOne!.mockResolvedValue(request);
      mockTxDeliveryPartnerRepo.findOne!.mockResolvedValue(partner);
      mockTxOrderRepo.findOne!.mockResolvedValue(order);

      const result = await service.acceptDeliveryRequest(501, 1);

      // 1. Request updated
      expect(request.status).toBe(DeliveryRequestStatus.ACCEPTED);
      expect(request.deliveryPartnerId).toBe(1);
      expect(request.respondedAt).toBeInstanceOf(Date);
      expect(mockTxDeliveryRequestRepo.save).toHaveBeenCalledWith(request);

      // 2. Partner activeOrderCount incremented
      expect(partner.activeOrderCount).toBe(2);
      expect(mockTxDeliveryPartnerRepo.save).toHaveBeenCalledWith(partner);

      // 3. Order assigned
      expect(order.deliveryPartnerId).toBe(1);
      expect(mockTxOrderRepo.save).toHaveBeenCalledWith(order);
      expect(result).toBe(order);

      // 4. Competing requests cancelled
      expect(mockTxQueryBuilder.update).toHaveBeenCalledWith(DeliveryRequest);
      expect(mockTxQueryBuilder.set).toHaveBeenCalledWith({
        status: DeliveryRequestStatus.CANCELLED,
      });
      expect(mockTxQueryBuilder.where).toHaveBeenCalledWith(
        'orderId = :orderId AND id != :requestId AND status = :status',
        {
          orderId: 100,
          requestId: 501,
          status: DeliveryRequestStatus.PENDING,
        },
      );
      expect(mockTxQueryBuilder.execute).toHaveBeenCalled();
    });

    it('should successfully accept a Stage 2 BROADCAST offer and bind courier ID', async () => {
      const broadcastRequest = createMockRequest({
        id: 550,
        orderId: 100,
        deliveryPartnerId: null as any,
        stage: DispatchStage.BROADCAST,
        status: DeliveryRequestStatus.PENDING,
      });
      const partner = createMockPartner({ id: 9, activeOrderCount: 0 });
      const order = createMockOrder({ id: 100, deliveryPartnerId: undefined });

      mockTxDeliveryRequestRepo.findOne!.mockResolvedValue(broadcastRequest);
      mockTxDeliveryPartnerRepo.findOne!.mockResolvedValue(partner);
      mockTxOrderRepo.findOne!.mockResolvedValue(order);

      await service.acceptDeliveryRequest(550, 9);

      expect(broadcastRequest.status).toBe(DeliveryRequestStatus.ACCEPTED);
      expect(broadcastRequest.deliveryPartnerId).toBe(9);
      expect(order.deliveryPartnerId).toBe(9);
      expect(partner.activeOrderCount).toBe(1);
    });
  });

  // =========================================================================
  // 6. getIncomingOffer
  // =========================================================================
  describe('getIncomingOffer', () => {
    it('should return null when no pending serial offer exists for the courier', async () => {
      deliveryRequestRepository.findOne.mockResolvedValue(null);

      const result = await service.getIncomingOffer(1);

      expect(result).toBeNull();
      expect(deliveryRequestRepository.findOne).toHaveBeenCalledWith({
        where: {
          deliveryPartnerId: 1,
          stage: DispatchStage.SERIAL,
          status: DeliveryRequestStatus.PENDING,
        },
        relations: {
          order: {
            merchant: true,
            items: true,
          },
        },
        order: { createdAt: 'DESC' },
      });
    });

    it('should return the active serial offer if timer has not expired', async () => {
      const activeRequest = createMockRequest({
        id: 501,
        deliveryPartnerId: 1,
        stage: DispatchStage.SERIAL,
        status: DeliveryRequestStatus.PENDING,
        expiresAt: new Date(Date.now() + 15000), // 15 seconds remaining
      });
      deliveryRequestRepository.findOne.mockResolvedValue(activeRequest);

      const result = await service.getIncomingOffer(1);

      expect(result).toBe(activeRequest);
      expect(deliveryRequestRepository.save).not.toHaveBeenCalled();
    });

    it('should mark request EXPIRED, trigger cascadeNextDispatch, and return null if timer elapsed', async () => {
      const expiredRequest = createMockRequest({
        id: 501,
        orderId: 100,
        deliveryPartnerId: 1,
        stage: DispatchStage.SERIAL,
        status: DeliveryRequestStatus.PENDING,
        expiresAt: new Date(Date.now() - 5000), // 5 seconds expired
      });
      deliveryRequestRepository.findOne.mockResolvedValue(expiredRequest);

      const cascadeSpy = jest
        .spyOn(service, 'cascadeNextDispatch')
        .mockResolvedValue(null);

      const result = await service.getIncomingOffer(1);

      expect(expiredRequest.status).toBe(DeliveryRequestStatus.EXPIRED);
      expect(deliveryRequestRepository.save).toHaveBeenCalledWith(expiredRequest);
      expect(cascadeSpy).toHaveBeenCalledWith(100);
      expect(result).toBeNull();
    });

    it('should handle background cascade errors gracefully without unhandled rejections', async () => {
      const expiredRequest = createMockRequest({
        id: 501,
        orderId: 100,
        expiresAt: new Date(Date.now() - 5000),
      });
      deliveryRequestRepository.findOne.mockResolvedValue(expiredRequest);

      jest
        .spyOn(service, 'cascadeNextDispatch')
        .mockRejectedValue(new Error('Cascade DB timeout'));

      const result = await service.getIncomingOffer(1);

      expect(result).toBeNull();
      expect(expiredRequest.status).toBe(DeliveryRequestStatus.EXPIRED);
    });
  });

  // =========================================================================
  // 7. getRadarOffers
  // =========================================================================
  describe('getRadarOffers', () => {
    it('should return empty array if courier does not exist or is offline or unverified', async () => {
      deliveryPartnerRepository.findOne.mockResolvedValue(null);
      expect(await service.getRadarOffers(1)).toEqual([]);

      deliveryPartnerRepository.findOne.mockResolvedValue(
        createMockPartner({ id: 1, isOnline: false }),
      );
      expect(await service.getRadarOffers(1)).toEqual([]);

      deliveryPartnerRepository.findOne.mockResolvedValue(
        createMockPartner({ id: 1, isVerified: false }),
      );
      expect(await service.getRadarOffers(1)).toEqual([]);
    });

    it('should return empty array if courier has reached maximum order capacity (>= 2)', async () => {
      deliveryPartnerRepository.findOne.mockResolvedValue(
        createMockPartner({ id: 1, activeOrderCount: 2 }),
      );
      expect(await service.getRadarOffers(1)).toEqual([]);
    });

    it('should return empty array if courier GPS coordinates are missing', async () => {
      deliveryPartnerRepository.findOne.mockResolvedValue(
        createMockPartner({ id: 1, latitude: null as any }),
      );
      expect(await service.getRadarOffers(1)).toEqual([]);

      deliveryPartnerRepository.findOne.mockResolvedValue(
        createMockPartner({ id: 1, longitude: undefined }),
      );
      expect(await service.getRadarOffers(1)).toEqual([]);
    });

    it('should return empty array if no active broadcast requests exist', async () => {
      deliveryPartnerRepository.findOne.mockResolvedValue(
        createMockPartner({ id: 1 }),
      );
      deliveryRequestRepository.find.mockResolvedValue([]);

      const result = await service.getRadarOffers(1);
      expect(result).toEqual([]);
    });

    it('should exclude broadcast requests for orders previously rejected by the courier', async () => {
      const partner = createMockPartner({ id: 1 });
      deliveryPartnerRepository.findOne.mockResolvedValue(partner);

      // Two broadcast requests for orders 101 and 102
      const broadcast101 = createMockRequest({
        id: 601,
        orderId: 101,
        stage: DispatchStage.BROADCAST,
        order: createMockOrder({ id: 101, merchant: mockMerchant as any }),
      });
      const broadcast102 = createMockRequest({
        id: 602,
        orderId: 102,
        stage: DispatchStage.BROADCAST,
        order: createMockOrder({ id: 102, merchant: mockMerchant as any }),
      });

      // Mock first find for active broadcasts, second find for previous rejections
      deliveryRequestRepository.find
        .mockResolvedValueOnce([broadcast101, broadcast102])
        .mockResolvedValueOnce([
          { orderId: 101 } as DeliveryRequest, // Partner previously rejected order 101
        ]);

      const offers = await service.getRadarOffers(1);

      expect(offers).toHaveLength(1);
      expect(offers[0].orderId).toBe(102);
    });

    it('should filter out broadcast orders farther than 10km and rank remaining closest-first', async () => {
      const partner = createMockPartner({
        id: 1,
        latitude: MERCHANT_LAT,
        longitude: MERCHANT_LNG,
      });
      deliveryPartnerRepository.findOne.mockResolvedValue(partner);

      // Merchant 1: ~1.4 km away
      const reqClose = createMockRequest({
        id: 601,
        orderId: 101,
        stage: DispatchStage.BROADCAST,
        order: createMockOrder({
          id: 101,
          merchant: { latitude: 24.87, longitude: 67.01 } as any,
        }),
      });

      // Merchant 2: ~7.6 km away (within 10km)
      const reqMid = createMockRequest({
        id: 602,
        orderId: 102,
        stage: DispatchStage.BROADCAST,
        order: createMockOrder({
          id: 102,
          merchant: { latitude: 24.91, longitude: 67.05 } as any,
        }),
      });

      // Merchant 3: ~15 km away (outside 10km)
      const reqFar = createMockRequest({
        id: 603,
        orderId: 103,
        stage: DispatchStage.BROADCAST,
        order: createMockOrder({
          id: 103,
          merchant: { latitude: 24.95, longitude: 67.12 } as any,
        }),
      });

      // Mock active broadcasts, followed by empty rejections
      deliveryRequestRepository.find
        .mockResolvedValueOnce([reqMid, reqFar, reqClose])
        .mockResolvedValueOnce([]);

      const offers = await service.getRadarOffers(1);

      expect(offers).toHaveLength(2);
      expect(offers[0].id).toBe(601); // Closest (~1.4km)
      expect(offers[1].id).toBe(602); // Mid (~7.6km)
      expect(offers[0].distanceKm).toBeLessThan(offers[1].distanceKm);
    });

    it('should skip broadcast requests where merchant or merchant coordinates are missing', async () => {
      const partner = createMockPartner({ id: 1 });
      deliveryPartnerRepository.findOne.mockResolvedValue(partner);

      const reqNoMerchant = createMockRequest({
        id: 601,
        orderId: 101,
        order: createMockOrder({ id: 101, merchant: undefined }),
      });
      const reqNoCoords = createMockRequest({
        id: 602,
        orderId: 102,
        order: createMockOrder({
          id: 102,
          merchant: { latitude: null, longitude: 67.0 } as any,
        }),
      });

      deliveryRequestRepository.find
        .mockResolvedValueOnce([reqNoMerchant, reqNoCoords])
        .mockResolvedValueOnce([]);

      const offers = await service.getRadarOffers(1);
      expect(offers).toEqual([]);
    });
  });

  // =========================================================================
  // 8. sweepExpiredRequests
  // =========================================================================
  describe('sweepExpiredRequests', () => {
    it('should use SKIP LOCKED row-level locking query for non-blocking concurrency', async () => {
      mockTxQueryBuilder.getMany.mockResolvedValue([]);

      const count = await service.sweepExpiredRequests();

      expect(count).toBe(0);
      expect(mockTxQueryBuilder.setLock).toHaveBeenCalledWith('pessimistic_write');
      expect(mockTxQueryBuilder.setOnLocked).toHaveBeenCalledWith('skip_locked');
      expect(mockTxQueryBuilder.where).toHaveBeenCalledWith('req.status = :status', {
        status: DeliveryRequestStatus.PENDING,
      });
      expect(mockTxQueryBuilder.limit).toHaveBeenCalledWith(20);
    });

    it('should batch update expired requests to EXPIRED and trigger deduplicated cascades', async () => {
      const exp1 = createMockRequest({ id: 701, orderId: 100 });
      const exp2 = createMockRequest({ id: 702, orderId: 100 }); // Same orderId (e.g. race offers)
      const exp3 = createMockRequest({ id: 703, orderId: 200 }); // Different orderId

      mockTxQueryBuilder.getMany.mockResolvedValue([exp1, exp2, exp3]);

      const cascadeSpy = jest
        .spyOn(service, 'cascadeNextDispatch')
        .mockResolvedValue(null);

      const count = await service.sweepExpiredRequests();

      expect(count).toBe(3);
      expect(exp1.status).toBe(DeliveryRequestStatus.EXPIRED);
      expect(exp2.status).toBe(DeliveryRequestStatus.EXPIRED);
      expect(exp3.status).toBe(DeliveryRequestStatus.EXPIRED);
      expect(mockTxDeliveryRequestRepo.save).toHaveBeenCalledWith([exp1, exp2, exp3]);

      // Deduplication check: 3 expired requests for 2 orders -> cascade called exactly twice
      expect(cascadeSpy).toHaveBeenCalledTimes(2);
      expect(cascadeSpy).toHaveBeenCalledWith(100);
      expect(cascadeSpy).toHaveBeenCalledWith(200);
    });

    it('should continue cascading remaining orders if one cascade fails', async () => {
      const exp1 = createMockRequest({ id: 701, orderId: 100 });
      const exp2 = createMockRequest({ id: 702, orderId: 200 });

      mockTxQueryBuilder.getMany.mockResolvedValue([exp1, exp2]);

      const cascadeSpy = jest
        .spyOn(service, 'cascadeNextDispatch')
        .mockRejectedValueOnce(new Error('Cascading error for order 100'))
        .mockResolvedValueOnce(null);

      const count = await service.sweepExpiredRequests();

      expect(count).toBe(2);
      expect(cascadeSpy).toHaveBeenCalledWith(100);
      expect(cascadeSpy).toHaveBeenCalledWith(200); // 200 executed despite 100 failing
    });
  });

  // =========================================================================
  // Adversarial & High-Leverage Concurrency Invariant Scenarios
  // =========================================================================
  describe('Adversarial & Concurrency Scenarios', () => {
    it('Race Condition: Second courier attempting to accept already claimed offer fails with ConflictException', async () => {
      // Courier 1 successfully accepts request 501
      const request501 = createMockRequest({
        id: 501,
        orderId: 100,
        deliveryPartnerId: 1,
        status: DeliveryRequestStatus.PENDING,
      });
      const courier1 = createMockPartner({ id: 1, activeOrderCount: 0 });
      const order = createMockOrder({ id: 100, deliveryPartnerId: undefined });

      mockTxDeliveryRequestRepo.findOne!.mockResolvedValue(request501);
      mockTxDeliveryPartnerRepo.findOne!.mockResolvedValue(courier1);
      mockTxOrderRepo.findOne!.mockResolvedValue(order);

      await service.acceptDeliveryRequest(501, 1);
      expect(order.deliveryPartnerId).toBe(1);

      // Now Courier 2 simultaneously tries to accept the same request (or order)
      // Transaction for Courier 2 sees request is now ACCEPTED
      const claimedRequest = createMockRequest({
        id: 501,
        orderId: 100,
        deliveryPartnerId: 1,
        status: DeliveryRequestStatus.ACCEPTED,
      });
      mockTxDeliveryRequestRepo.findOne!.mockResolvedValue(claimedRequest);

      await expect(service.acceptDeliveryRequest(501, 2)).rejects.toThrow(
        ConflictException,
      );
    });

    it('Zero-distance coordinates (courier standing directly at merchant location)', async () => {
      const pZero = createMockPartner({
        id: 1,
        latitude: MERCHANT_LAT,
        longitude: MERCHANT_LNG,
      });
      deliveryPartnerRepository.find.mockResolvedValue([pZero]);

      const candidates = await service.findEligibleCandidates(
        MERCHANT_LAT,
        MERCHANT_LNG,
        INITIAL_DISPATCH_RADIUS_KM,
      );

      expect(candidates).toHaveLength(1);
      expect(candidates[0].distanceKm).toBe(0);
    });

    it('Antipodal and extreme coordinates handling without crashing or negative distances', async () => {
      const pAntipodal = createMockPartner({
        id: 1,
        latitude: -MERCHANT_LAT,
        longitude: MERCHANT_LNG - 180,
      });
      deliveryPartnerRepository.find.mockResolvedValue([pAntipodal]);

      // Haversine distance should not crash and return > 5km
      const candidates = await service.findEligibleCandidates(
        MERCHANT_LAT,
        MERCHANT_LNG,
        INITIAL_DISPATCH_RADIUS_KM,
      );

      expect(candidates).toHaveLength(0); // Far beyond 5km
    });
  });
});
