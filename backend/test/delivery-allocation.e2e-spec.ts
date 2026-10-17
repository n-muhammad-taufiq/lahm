import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { AuthenticationService } from '../src/authentication/authentication.service';
import { Role } from '../src/users/enums/role.enum';
import { User } from '../src/users/entities/user.entity';
import { Customer } from '../src/customers/entities/customer.entity';
import { Merchant } from '../src/merchants/entities/merchant.entity';
import { DeliveryPartner } from '../src/delivery-partners/entities/delivery-partner.entity';
import { Order } from '../src/orders/entities/order.entity';
import { OrderStatus } from '../src/orders/enums/order-status.enum';
import { DeliveryRequest } from '../src/delivery-allocation/entities/delivery-request.entity';
import {
  DeliveryRequestStatus,
  DispatchStage,
} from '../src/delivery-allocation/enums/delivery-request.enum';

describe('Delivery Allocation System (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let authService: AuthenticationService;

  let courierUser: User;
  let courierPartner: DeliveryPartner;
  let courierToken: string;

  let customerUser: User;
  let customer: Customer;
  let customerToken: string;

  let merchantUser: User;
  let merchant: Merchant;
  let merchantToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );
    await app.init();

    dataSource = app.get(DataSource);
    authService = app.get(AuthenticationService);

    // Clean tables for isolated e2e environment
    await dataSource.query(
      'TRUNCATE TABLE delivery_requests, order_items, orders, delivery_partner, merchant, customer, "user" CASCADE',
    );

    // 1. Seed Courier User & Partner
    const userRepo = dataSource.getRepository(User);
    const partnerRepo = dataSource.getRepository(DeliveryPartner);
    const customerRepo = dataSource.getRepository(Customer);
    const merchantRepo = dataSource.getRepository(Merchant);

    const timestamp = Date.now();
    courierUser = await userRepo.save(
      userRepo.create({
        email: `courier_${timestamp}@lahm.com`,
        phoneNumber: `+92300${Math.floor(1000000 + Math.random() * 9000000)}`,
        name: 'Ahmed Courier',
        role: Role.DELIVERY_PARTNER,
      }),
    );

    courierPartner = await partnerRepo.save(
      partnerRepo.create({
        user: courierUser,
        isOnline: false,
        isVerified: true,
        activeOrderCount: 0,
        latitude: 24.861,
        longitude: 67.0015,
        lastLocationUpdatedAt: new Date(),
      }),
    );
    courierToken = (await authService.generateTokens(courierUser)).accessToken;

    // 2. Seed Customer
    customerUser = await userRepo.save(
      userRepo.create({
        email: `customer_${timestamp}@lahm.com`,
        phoneNumber: `+92301${Math.floor(1000000 + Math.random() * 9000000)}`,
        name: 'Fatima Customer',
        role: Role.CUSTOMER,
      }),
    );
    customer = await customerRepo.save(
      customerRepo.create({
        user: customerUser,
      }),
    );
    customerToken = (await authService.generateTokens(customerUser)).accessToken;

    // 3. Seed Merchant
    merchantUser = await userRepo.save(
      userRepo.create({
        email: `merchant_${timestamp}@lahm.com`,
        phoneNumber: `+92302${Math.floor(1000000 + Math.random() * 9000000)}`,
        name: 'Al-Barakah Butchery',
        role: Role.MERCHANT,
      }),
    );
    merchant = await merchantRepo.save(
      merchantRepo.create({
        user: merchantUser,
        shopName: 'Al-Barakah Halal Meats',
        latitude: 24.8607,
        longitude: 67.0011,
        shopAddress: 'Main Commercial Ave, Karachi',
      }),
    );
    merchantToken = (await authService.generateTokens(merchantUser)).accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  // =========================================================================
  // 1. Security & RBAC Guards
  // =========================================================================
  describe('RBAC & Authentication Guards', () => {
    it('should reject unauthenticated requests to delivery-requests endpoints with 401', async () => {
      await request(app.getHttpServer())
        .get('/delivery-requests/incoming')
        .expect(401);

      await request(app.getHttpServer())
        .get('/delivery-requests/radar')
        .expect(401);

      await request(app.getHttpServer())
        .post('/delivery-requests/1/accept')
        .expect(401);

      await request(app.getHttpServer())
        .post('/delivery-requests/1/reject')
        .expect(401);
    });

    it('should reject non-courier roles (e.g. CUSTOMER) with 403 Forbidden', async () => {
      await request(app.getHttpServer())
        .get('/delivery-requests/incoming')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);

      await request(app.getHttpServer())
        .post('/delivery-requests/1/accept')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);
    });

    it('should allow authenticated couriers to poll incoming offers (returns null when empty)', async () => {
      const response = await request(app.getHttpServer())
        .get('/delivery-requests/incoming')
        .set('Authorization', `Bearer ${courierToken}`)
        .expect(200);

      expect(response.body).toEqual({ offer: null });
    });
  });

  // =========================================================================
  // 2. Courier Duty & Location Endpoints
  // =========================================================================
  describe('Duty Toggle & Live Location Updates', () => {
    it('should toggle courier duty status to online (PATCH /delivery-partners/duty)', async () => {
      const response = await request(app.getHttpServer())
        .patch('/delivery-partners/duty')
        .set('Authorization', `Bearer ${courierToken}`)
        .send({ isOnline: true })
        .expect(200);

      expect(response.body.isOnline).toBe(true);

      const updated = await dataSource
        .getRepository(DeliveryPartner)
        .findOne({ where: { id: courierPartner.id } });
      expect(updated?.isOnline).toBe(true);
    });

    it('should update live GPS location coordinates (PATCH /delivery-partners/location)', async () => {
      const response = await request(app.getHttpServer())
        .patch('/delivery-partners/location')
        .set('Authorization', `Bearer ${courierToken}`)
        .send({ latitude: 24.8615, longitude: 67.0018 })
        .expect(200);

      expect(response.body.latitude).toBeCloseTo(24.8615, 4);
      expect(response.body.longitude).toBeCloseTo(67.0018, 4);
      expect(response.body.lastLocationUpdatedAt).toBeDefined();
    });

    it('should reject invalid coordinates out of GPS boundary', async () => {
      await request(app.getHttpServer())
        .patch('/delivery-partners/location')
        .set('Authorization', `Bearer ${courierToken}`)
        .send({ latitude: 95.0, longitude: 67.0 }) // Latitude > 90
        .expect(400);

      await request(app.getHttpServer())
        .patch('/delivery-partners/location')
        .set('Authorization', `Bearer ${courierToken}`)
        .send({ latitude: 24.0, longitude: 200.0 }) // Longitude > 180
        .expect(400);
    });
  });

  // =========================================================================
  // 3. End-to-End Order Dispatch & Acceptance Lifecycle
  // =========================================================================
  describe('Full Order Dispatch & Acceptance Lifecycle', () => {
    let order: Order;

    beforeEach(async () => {
      // Clear previous delivery requests
      await dataSource.query('DELETE FROM delivery_requests');

      // Ensure courier is online and available
      await dataSource.getRepository(DeliveryPartner).update(
        { id: courierPartner.id },
        {
          isOnline: true,
          activeOrderCount: 0,
          latitude: 24.861,
          longitude: 67.0015,
          lastLocationUpdatedAt: new Date(),
        },
      );

      // Create a fresh test order in ACCEPTED status
      const orderRepo = dataSource.getRepository(Order);
      order = await orderRepo.save(
        orderRepo.create({
          customerId: customer.id,
          merchantId: merchant.id,
          status: OrderStatus.ACCEPTED,
          subtotal: 75.0,
          deliveryFee: 15.0,
          platformFee: 1.0,
          total: 91.0,
          deliveryAddress: 'Block 4, Clifton, Karachi',
          deliveryLatitude: 24.82,
          deliveryLongitude: 67.03,
          distanceKm: 4.8,
          deliveryOtp: '7412',
        }),
      );
    });

    it('should automatically trigger dispatch and create 20s serial offer when order status moves to PREPARING', async () => {
      // Merchant begins preparing the food
      const statusRes = await request(app.getHttpServer())
        .patch(`/orders/${order.id}/status`)
        .set('Authorization', `Bearer ${merchantToken}`)
        .send({ status: OrderStatus.PREPARING })
        .expect(200);

      expect(statusRes.body.status).toBe(OrderStatus.PREPARING);

      // Give background dispatch promise a brief moment to complete
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Courier polls incoming offers
      const incomingRes = await request(app.getHttpServer())
        .get('/delivery-requests/incoming')
        .set('Authorization', `Bearer ${courierToken}`)
        .expect(200);

      expect(incomingRes.body.offer).toBeDefined();
      expect(incomingRes.body.offer.orderId).toBe(order.id);
      expect(incomingRes.body.offer.status).toBe(DeliveryRequestStatus.PENDING);
      expect(incomingRes.body.offer.stage).toBe(DispatchStage.SERIAL);
      expect(Number(incomingRes.body.offer.estimatedPayout)).toBe(15.0);
      expect(incomingRes.body.offer.order).toBeDefined();
      expect(incomingRes.body.offer.order.merchant.shopName).toBe(
        'Al-Barakah Halal Meats',
      );
    });

    it('should decline offer and cascade immediately when courier rejects (POST /delivery-requests/:id/reject)', async () => {
      // Trigger dispatch
      await request(app.getHttpServer())
        .patch(`/orders/${order.id}/status`)
        .set('Authorization', `Bearer ${merchantToken}`)
        .send({ status: OrderStatus.PREPARING })
        .expect(200);

      await new Promise((resolve) => setTimeout(resolve, 300));

      // Get incoming offer
      const incomingRes = await request(app.getHttpServer())
        .get('/delivery-requests/incoming')
        .set('Authorization', `Bearer ${courierToken}`)
        .expect(200);

      const requestId = incomingRes.body.offer.id;

      // Courier rejects
      const rejectRes = await request(app.getHttpServer())
        .post(`/delivery-requests/${requestId}/reject`)
        .set('Authorization', `Bearer ${courierToken}`)
        .expect(201);

      expect(rejectRes.body.message).toBe('Delivery offer declined');

      // Verify request status in database
      const requestInDb = await dataSource
        .getRepository(DeliveryRequest)
        .findOne({ where: { id: requestId } });
      expect(requestInDb?.status).toBe(DeliveryRequestStatus.REJECTED);
      expect(requestInDb?.respondedAt).toBeDefined();
    });

    it('should atomically accept offer with pessimistic locks, assign order, and increment activeOrderCount (POST /delivery-requests/:id/accept)', async () => {
      // Reset courier activeOrderCount to 0
      await dataSource
        .getRepository(DeliveryPartner)
        .update({ id: courierPartner.id }, { activeOrderCount: 0 });

      // Trigger dispatch
      await request(app.getHttpServer())
        .patch(`/orders/${order.id}/status`)
        .set('Authorization', `Bearer ${merchantToken}`)
        .send({ status: OrderStatus.PREPARING })
        .expect(200);

      await new Promise((resolve) => setTimeout(resolve, 300));

      // Poll incoming offer
      const incomingRes = await request(app.getHttpServer())
        .get('/delivery-requests/incoming')
        .set('Authorization', `Bearer ${courierToken}`)
        .expect(200);

      const requestId = incomingRes.body.offer.id;

      // Courier accepts offer
      const acceptRes = await request(app.getHttpServer())
        .post(`/delivery-requests/${requestId}/accept`)
        .set('Authorization', `Bearer ${courierToken}`)
        .expect(201);

      expect(acceptRes.body.message).toBe('Delivery offer accepted successfully');
      expect(acceptRes.body.order.deliveryPartnerId).toBe(courierPartner.id);

      // Verify database entities
      const updatedOrder = await dataSource
        .getRepository(Order)
        .findOne({ where: { id: order.id } });
      expect(updatedOrder?.deliveryPartnerId).toBe(courierPartner.id);

      const updatedPartner = await dataSource
        .getRepository(DeliveryPartner)
        .findOne({ where: { id: courierPartner.id } });
      expect(updatedPartner?.activeOrderCount).toBe(1);

      const updatedRequest = await dataSource
        .getRepository(DeliveryRequest)
        .findOne({ where: { id: requestId } });
      expect(updatedRequest?.status).toBe(DeliveryRequestStatus.ACCEPTED);
      expect(updatedRequest?.respondedAt).toBeDefined();
    });
  });

  // =========================================================================
  // 4. Stage 2 Open Radar Broadcast Query
  // =========================================================================
  describe('Stage 2 Open Radar Broadcast Query', () => {
    it('should return active broadcast offers within 10km radius (GET /delivery-requests/radar)', async () => {
      const orderRepo = dataSource.getRepository(Order);
      const requestRepo = dataSource.getRepository(DeliveryRequest);

      // Seed an order
      const radarOrder = await orderRepo.save(
        orderRepo.create({
          customerId: customer.id,
          merchantId: merchant.id,
          status: OrderStatus.PREPARING,
          subtotal: 60.0,
          deliveryFee: 20.0,
          platformFee: 1.0,
          total: 81.0,
          deliveryAddress: 'DHA Phase 6, Karachi',
          deliveryOtp: '9988',
        }),
      );

      // Seed an unexpired broadcast request
      await requestRepo.save(
        requestRepo.create({
          orderId: radarOrder.id,
          deliveryPartnerId: null as any,
          status: DeliveryRequestStatus.PENDING,
          stage: DispatchStage.BROADCAST,
          attemptNumber: 9,
          distanceKm: 0,
          estimatedPayout: 20.0,
          expiresAt: new Date(Date.now() + 60000), // 1 minute in the future
        }),
      );

      // Ensure courier is online and activeOrderCount < 2
      await dataSource
        .getRepository(DeliveryPartner)
        .update({ id: courierPartner.id }, { isOnline: true, activeOrderCount: 0 });

      const response = await request(app.getHttpServer())
        .get('/delivery-requests/radar')
        .set('Authorization', `Bearer ${courierToken}`)
        .expect(200);

      expect(response.body.offers).toBeDefined();
      expect(response.body.offers.length).toBeGreaterThanOrEqual(1);

      const matchedOffer = response.body.offers.find(
        (o: any) => o.orderId === radarOrder.id,
      );
      expect(matchedOffer).toBeDefined();
      expect(matchedOffer.stage).toBe(DispatchStage.BROADCAST);
      expect(Number(matchedOffer.estimatedPayout)).toBe(20.0);
    });
  });
});
