jest.mock('firebase-admin/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
  cert: jest.fn(),
}));
jest.mock('firebase-admin/auth', () => ({
  getAuth: jest.fn(() => ({
    verifyIdToken: jest.fn(),
  })),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { OrdersService, generateDeliveryOtp } from './orders.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Merchant } from '../merchants/entities/merchant.entity';
import { Product } from '../products/entities/product.entity';
import { OrderStatus } from './enums/order-status.enum';
import { Role } from '../users/enums/role.enum';
import { CreateOrderDto } from './dtos/create-order.dto';
import {
  DEFAULT_PLATFORM_FEE,
  DEFAULT_PRICING_CONFIG,
} from './constants/pricing.constants';

describe('OrdersService', () => {
  let service: OrdersService;
  let orderRepository: jest.Mocked<Repository<Order>>;
  let orderItemRepository: jest.Mocked<Repository<OrderItem>>;
  let customerRepository: jest.Mocked<Repository<Customer>>;
  let merchantRepository: jest.Mocked<Repository<Merchant>>;
  let productRepository: jest.Mocked<Repository<Product>>;
  let dataSource: jest.Mocked<DataSource>;
  let mockEntityManager: { create: jest.Mock; save: jest.Mock };

  const mockCustomer: Customer = {
    id: 1,
    user: { id: 10, email: 'customer@lahm.com', role: Role.CUSTOMER } as any,
  } as any;

  const mockMerchant: Merchant = {
    id: 10,
    shopName: 'Al-Barakah Halal Meats',
    latitude: 24.8607,
    longitude: 67.0011,
    user: { id: 20, email: 'merchant@lahm.com', role: Role.MERCHANT } as any,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;

  const mockProduct1: Product = {
    id: 101,
    name: 'Halal Lamb Chops',
    price: 25.5,
    stock: 20,
    isAvailable: true,
    merchantId: 10,
    merchant: mockMerchant,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;

  const mockProduct2: Product = {
    id: 102,
    name: 'Prime Beef Ribs',
    price: 15.0,
    stock: 30,
    isAvailable: true,
    merchantId: 10,
    merchant: mockMerchant,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;

  const mockOrder: Order = {
    id: 50,
    customerId: 1,
    merchantId: 10,
    status: OrderStatus.PLACED,
    subtotal: 66.0,
    deliveryFee: 14.6,
    platformFee: DEFAULT_PLATFORM_FEE,
    total: 81.6,
    deliveryAddress: '123 Market Street, Karachi',
    deliveryLatitude: 24.892,
    deliveryLongitude: 67.0748,
    distanceKm: 8.4,
    deliveryOtp: '4821',
    items: [],
    customer: mockCustomer,
    merchant: mockMerchant,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockEntityManager = {
      create: jest.fn().mockImplementation((entityClass, plainObj) => plainObj),
      save: jest.fn().mockImplementation(async (entityClass, entity) => {
        if (Array.isArray(entity)) {
          return entity.map((item, idx) => ({ ...item, id: idx + 1 }));
        }
        return { ...entity, id: entity.id ?? 50 };
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Customer),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Merchant),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Product),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn((cb) => cb(mockEntityManager)),
          },
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    orderRepository = module.get(getRepositoryToken(Order));
    orderItemRepository = module.get(getRepositoryToken(OrderItem));
    customerRepository = module.get(getRepositoryToken(Customer));
    merchantRepository = module.get(getRepositoryToken(Merchant));
    productRepository = module.get(getRepositoryToken(Product));
    dataSource = module.get<DataSource>(DataSource) as jest.Mocked<DataSource>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // =========================================================================
  // Helper / Utility Tests
  // =========================================================================
  describe('generateDeliveryOtp', () => {
    it('should generate a 4-digit numeric string between 1000 and 9999', () => {
      for (let i = 0; i < 50; i++) {
        const otp = generateDeliveryOtp();
        expect(otp).toMatch(/^\d{4}$/);
        const num = parseInt(otp, 10);
        expect(num).toBeGreaterThanOrEqual(1000);
        expect(num).toBeLessThanOrEqual(9999);
      }
    });
  });

  // =========================================================================
  // Delivery Fee Calculation (Haversine & Boundaries)
  // =========================================================================
  describe('calculateDeliveryFee', () => {
    it('should return base fare when distance is null', () => {
      const fee = service.calculateDeliveryFee(null);
      expect(fee).toBe(DEFAULT_PRICING_CONFIG.baseFare);
    });

    it('should return base fare when distance is 0 km', () => {
      const fee = service.calculateDeliveryFee(0);
      expect(fee).toBe(DEFAULT_PRICING_CONFIG.baseFare);
    });

    it('should return base fare when distance is within baseKm (e.g. 1.5 km <= 2.0 km)', () => {
      const fee = service.calculateDeliveryFee(1.5);
      expect(fee).toBe(DEFAULT_PRICING_CONFIG.baseFare);
    });

    it('should return base fare at boundary distance exactly equal to baseKm (2.0 km)', () => {
      const fee = service.calculateDeliveryFee(2.0);
      expect(fee).toBe(DEFAULT_PRICING_CONFIG.baseFare);
    });

    it('should calculate dynamic tiered fee beyond baseKm', () => {
      // 5.0 km: extra 3.0 km * $1.5/km = $4.5 + $5.0 base = $9.50
      const fee = service.calculateDeliveryFee(5.0);
      expect(fee).toBe(9.5);
    });

    it('should round dynamic fee to 2 decimal places for fractional distances', () => {
      // 2.33 km: extra 0.33 km * $1.5/km = $0.495 + $5.0 base = $5.495 => $5.50
      const fee = service.calculateDeliveryFee(2.33);
      expect(fee).toBe(5.5);
    });

    it('should throw BadRequestException if distance is negative', () => {
      expect(() => service.calculateDeliveryFee(-1)).toThrow(
        new BadRequestException('Distance cannot be negative'),
      );
      expect(() => service.calculateDeliveryFee(-0.01)).toThrow(
        BadRequestException,
      );
    });

    it('should respect custom delivery pricing configuration', () => {
      const customConfig = {
        baseFare: 10.0,
        baseKm: 5.0,
        perKmRate: 2.0,
      };
      // Within base: 4 km -> 10.0
      expect(service.calculateDeliveryFee(4.0, customConfig)).toBe(10.0);
      // Beyond base: 8 km -> 10.0 + (3 * 2.0) = 16.0
      expect(service.calculateDeliveryFee(8.0, customConfig)).toBe(16.0);
    });
  });

  // =========================================================================
  // 1. Order Creation (Happy path, Edge cases, Rollbacks, Security)
  // =========================================================================
  describe('create', () => {
    const validDto: CreateOrderDto = {
      merchantId: 10,
      items: [
        { productId: 101, quantity: 2 },
        { productId: 102, quantity: 1 },
      ],
      deliveryAddress: '123 Market Street, Karachi',
      deliveryLatitude: 24.892,
      deliveryLongitude: 67.0748,
    };

    it('should successfully calculate subtotal from DB prices, Haversine delivery fee, platform fee, and persist via atomic transaction', async () => {
      customerRepository.findOne.mockResolvedValue(mockCustomer);
      merchantRepository.findOne.mockResolvedValue(mockMerchant);
      productRepository.find.mockResolvedValue([mockProduct1, mockProduct2]);

      const result = await service.create(1, validDto);

      // 1. Verify customer and merchant lookups
      expect(customerRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(merchantRepository.findOne).toHaveBeenCalledWith({
        where: { id: 10 },
      });

      // 2. Verify batch product lookup
      expect(productRepository.find).toHaveBeenCalledWith({
        where: { id: expect.anything() },
      });

      // 3. Verify subtotal calculation:
      // Product 101: 25.50 * 2 = 51.00
      // Product 102: 15.00 * 1 = 15.00
      // Subtotal = 66.00
      // Haversine distance ~8.2 km: base (5.0) + (8.2 - 2.0) * 1.5 = 5.0 + 9.3 = 14.30
      // Platform fee = 1.00
      // Total = 66.00 + 14.30 + 1.00 = 81.30
      expect(dataSource.transaction).toHaveBeenCalled();
      expect(mockEntityManager.create).toHaveBeenCalledWith(
        Order,
        expect.objectContaining({
          customerId: 1,
          merchantId: 10,
          status: OrderStatus.PLACED,
          subtotal: 66.0,
          deliveryFee: 14.3,
          platformFee: DEFAULT_PLATFORM_FEE,
          total: 81.3,
          deliveryAddress: '123 Market Street, Karachi',
          deliveryLatitude: 24.892,
          deliveryLongitude: 67.0748,
          distanceKm: 8.2,
          deliveryOtp: expect.stringMatching(/^\d{4}$/),
        }),
      );

      // 4. Verify order items creation with calculated server prices
      expect(mockEntityManager.create).toHaveBeenCalledWith(
        OrderItem,
        expect.objectContaining({
          productId: 101,
          productName: 'Halal Lamb Chops',
          unitPrice: 25.5,
          quantity: 2,
          totalPrice: 51.0,
          orderId: 50,
        }),
      );
      expect(mockEntityManager.create).toHaveBeenCalledWith(
        OrderItem,
        expect.objectContaining({
          productId: 102,
          productName: 'Prime Beef Ribs',
          unitPrice: 15.0,
          quantity: 1,
          totalPrice: 15.0,
          orderId: 50,
        }),
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(50);
      expect(result.items).toHaveLength(2);
    });

    it('should default to base delivery fee and undefined distance if coordinates are omitted', async () => {
      const dtoWithoutCoords: CreateOrderDto = {
        merchantId: 10,
        items: [{ productId: 101, quantity: 1 }],
        deliveryAddress: 'Downtown Lahore',
      };

      customerRepository.findOne.mockResolvedValue(mockCustomer);
      merchantRepository.findOne.mockResolvedValue({
        ...mockMerchant,
        latitude: null,
        longitude: null,
      } as any);
      productRepository.find.mockResolvedValue([mockProduct1]);

      const result = await service.create(1, dtoWithoutCoords);

      expect(mockEntityManager.create).toHaveBeenCalledWith(
        Order,
        expect.objectContaining({
          subtotal: 25.5,
          deliveryFee: DEFAULT_PRICING_CONFIG.baseFare,
          platformFee: DEFAULT_PLATFORM_FEE,
          total: 25.5 + DEFAULT_PRICING_CONFIG.baseFare + DEFAULT_PLATFORM_FEE,
          distanceKm: undefined,
        }),
      );
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if customer does not exist', async () => {
      customerRepository.findOne.mockResolvedValue(null);

      await expect(service.create(999, validDto)).rejects.toThrow(
        new NotFoundException('Customer #999 not found'),
      );
      expect(merchantRepository.findOne).not.toHaveBeenCalled();
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if merchant does not exist', async () => {
      customerRepository.findOne.mockResolvedValue(mockCustomer);
      merchantRepository.findOne.mockResolvedValue(null);

      await expect(service.create(1, validDto)).rejects.toThrow(
        new NotFoundException('Merchant #10 not found'),
      );
      expect(productRepository.find).not.toHaveBeenCalled();
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if order items array is empty', async () => {
      const emptyItemsDto: CreateOrderDto = {
        merchantId: 10,
        items: [],
        deliveryAddress: 'Any address',
      };

      await expect(service.create(1, emptyItemsDto)).rejects.toThrow(
        new BadRequestException('Order must contain at least one item'),
      );
      expect(customerRepository.findOne).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if one or more products are missing in database', async () => {
      customerRepository.findOne.mockResolvedValue(mockCustomer);
      merchantRepository.findOne.mockResolvedValue(mockMerchant);
      // Query returned only 1 product instead of requested 2
      productRepository.find.mockResolvedValue([mockProduct1]);

      await expect(service.create(1, validDto)).rejects.toThrow(
        new BadRequestException(
          'One or more products in the order could not be found',
        ),
      );
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if any product belongs to a different merchant (IDOR / merchant mismatch)', async () => {
      customerRepository.findOne.mockResolvedValue(mockCustomer);
      merchantRepository.findOne.mockResolvedValue(mockMerchant);

      const foreignProduct: Product = {
        ...mockProduct2,
        merchantId: 999, // Mismatched merchant!
      };
      productRepository.find.mockResolvedValue([mockProduct1, foreignProduct]);

      await expect(service.create(1, validDto)).rejects.toThrow(
        new BadRequestException(
          `Product #102 (Prime Beef Ribs) does not belong to merchant #10`,
        ),
      );
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if any requested product is marked unavailable (isAvailable: false)', async () => {
      customerRepository.findOne.mockResolvedValue(mockCustomer);
      merchantRepository.findOne.mockResolvedValue(mockMerchant);

      const outOfStockProduct: Product = {
        ...mockProduct2,
        isAvailable: false,
      };
      productRepository.find.mockResolvedValue([mockProduct1, outOfStockProduct]);

      await expect(service.create(1, validDto)).rejects.toThrow(
        new BadRequestException(
          `Product #102 (Prime Beef Ribs) is currently out of stock`,
        ),
      );
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('should reject and roll back atomically if database transaction write fails', async () => {
      customerRepository.findOne.mockResolvedValue(mockCustomer);
      merchantRepository.findOne.mockResolvedValue(mockMerchant);
      productRepository.find.mockResolvedValue([mockProduct1, mockProduct2]);

      mockEntityManager.save.mockRejectedValueOnce(
        new Error('Database deadlock / write constraint violation'),
      );

      await expect(service.create(1, validDto)).rejects.toThrow(
        'Database deadlock / write constraint violation',
      );
    });
  });

  // =========================================================================
  // 2. Query Methods
  // =========================================================================
  describe('findById', () => {
    it('should return order with all nested relations when order exists', async () => {
      orderRepository.findOne.mockResolvedValue(mockOrder);

      const result = await service.findById(50);

      expect(orderRepository.findOne).toHaveBeenCalledWith({
        where: { id: 50 },
        relations: {
          items: {
            product: true,
          },
          customer: {
            user: true,
          },
          merchant: true,
          deliveryPartner: {
            user: true,
          },
        },
      });
      expect(result).toEqual(mockOrder);
    });

    it('should throw NotFoundException if order does not exist', async () => {
      orderRepository.findOne.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(
        new NotFoundException('Order #999 not found'),
      );
    });
  });

  describe('findByCustomerId', () => {
    it('should return orders for specified customer ordered by createdAt DESC', async () => {
      orderRepository.find.mockResolvedValue([mockOrder]);

      const result = await service.findByCustomerId(1);

      expect(orderRepository.find).toHaveBeenCalledWith({
        where: { customerId: 1 },
        relations: {
          items: {
            product: true,
          },
          merchant: true,
          deliveryPartner: {
            user: true,
          },
        },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual([mockOrder]);
    });

    it('should return an empty list if customer has no orders', async () => {
      orderRepository.find.mockResolvedValue([]);

      const result = await service.findByCustomerId(99);
      expect(result).toEqual([]);
    });
  });

  describe('findByMerchantId', () => {
    it('should return orders for specified merchant ordered by createdAt DESC', async () => {
      orderRepository.find.mockResolvedValue([mockOrder]);

      const result = await service.findByMerchantId(10);

      expect(orderRepository.find).toHaveBeenCalledWith({
        where: { merchantId: 10 },
        relations: {
          items: {
            product: true,
          },
          customer: {
            user: true,
          },
          deliveryPartner: {
            user: true,
          },
        },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual([mockOrder]);
    });

    it('should return an empty list if merchant has no orders', async () => {
      orderRepository.find.mockResolvedValue([]);

      const result = await service.findByMerchantId(999);
      expect(result).toEqual([]);
    });
  });

  describe('findByDeliveryPartnerId', () => {
    it('should return orders for specified delivery partner ordered by createdAt DESC', async () => {
      orderRepository.find.mockResolvedValue([mockOrder]);

      const result = await service.findByDeliveryPartnerId(5);

      expect(orderRepository.find).toHaveBeenCalledWith({
        where: { deliveryPartnerId: 5 },
        relations: {
          items: {
            product: true,
          },
          customer: {
            user: true,
          },
          merchant: true,
        },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual([mockOrder]);
    });

    it('should return an empty list if delivery partner has no orders', async () => {
      orderRepository.find.mockResolvedValue([]);

      const result = await service.findByDeliveryPartnerId(999);
      expect(result).toEqual([]);
    });
  });

  // =========================================================================
  // 3. State Machine Transitions (8 States, RBAC, Terminal Permanence)
  // =========================================================================
  describe('updateStatus', () => {
    it('should return order unmodified without saving if newStatus equals currentStatus (idempotent)', async () => {
      orderRepository.findOne.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.PLACED,
      });

      const result = await service.updateStatus(
        50,
        OrderStatus.PLACED,
        Role.CUSTOMER,
      );

      expect(result.status).toBe(OrderStatus.PLACED);
      expect(orderRepository.save).not.toHaveBeenCalled();
    });

    // Customer Transitions
    describe('CUSTOMER role transitions', () => {
      it('should allow customer to cancel order in PLACED status with cancellation reason', async () => {
        const order = { ...mockOrder, status: OrderStatus.PLACED };
        orderRepository.findOne.mockResolvedValue(order);
        orderRepository.save.mockImplementation(async (entity) => entity as Order);

        const result = await service.updateStatus(
          50,
          OrderStatus.CANCELLED,
          Role.CUSTOMER,
          'Changed mind',
        );

        expect(result.status).toBe(OrderStatus.CANCELLED);
        expect(result.cancellationReason).toBe('Changed mind');
        expect(orderRepository.save).toHaveBeenCalledWith(
          expect.objectContaining({
            status: OrderStatus.CANCELLED,
            cancellationReason: 'Changed mind',
          }),
        );
      });

      it('should allow customer to cancel order in PLACED status without cancellation reason', async () => {
        const order = { ...mockOrder, status: OrderStatus.PLACED };
        orderRepository.findOne.mockResolvedValue(order);
        orderRepository.save.mockImplementation(async (entity) => entity as Order);

        const result = await service.updateStatus(
          50,
          OrderStatus.CANCELLED,
          Role.CUSTOMER,
        );

        expect(result.status).toBe(OrderStatus.CANCELLED);
      });

      it('should reject customer cancellation once order is ACCEPTED or further', async () => {
        const nonCancellableStates = [
          OrderStatus.ACCEPTED,
          OrderStatus.PREPARING,
          OrderStatus.READY_FOR_PICKUP,
          OrderStatus.OUT_FOR_DELIVERY,
          OrderStatus.DELIVERED,
        ];

        for (const status of nonCancellableStates) {
          orderRepository.findOne.mockResolvedValue({ ...mockOrder, status });
          await expect(
            service.updateStatus(50, OrderStatus.CANCELLED, Role.CUSTOMER),
          ).rejects.toThrow(BadRequestException);
        }
      });

      it('should reject customer trying to transition to non-cancelled states (e.g. ACCEPTED)', async () => {
        orderRepository.findOne.mockResolvedValue({
          ...mockOrder,
          status: OrderStatus.PLACED,
        });

        await expect(
          service.updateStatus(50, OrderStatus.ACCEPTED, Role.CUSTOMER),
        ).rejects.toThrow(
          new BadRequestException(
            `Role "${Role.CUSTOMER}" cannot transition order #50 from "PLACED" to "ACCEPTED"`,
          ),
        );
      });
    });

    // Merchant Transitions
    describe('MERCHANT role transitions', () => {
      it('should allow merchant to transition from PLACED to ACCEPTED', async () => {
        const order = { ...mockOrder, status: OrderStatus.PLACED };
        orderRepository.findOne.mockResolvedValue(order);
        orderRepository.save.mockImplementation(async (entity) => entity as Order);

        const result = await service.updateStatus(
          50,
          OrderStatus.ACCEPTED,
          Role.MERCHANT,
        );

        expect(result.status).toBe(OrderStatus.ACCEPTED);
      });

      it('should allow merchant to transition from PLACED to DECLINED', async () => {
        const order = { ...mockOrder, status: OrderStatus.PLACED };
        orderRepository.findOne.mockResolvedValue(order);
        orderRepository.save.mockImplementation(async (entity) => entity as Order);

        const result = await service.updateStatus(
          50,
          OrderStatus.DECLINED,
          Role.MERCHANT,
        );

        expect(result.status).toBe(OrderStatus.DECLINED);
      });

      it('should allow merchant to transition from ACCEPTED to PREPARING', async () => {
        const order = { ...mockOrder, status: OrderStatus.ACCEPTED };
        orderRepository.findOne.mockResolvedValue(order);
        orderRepository.save.mockImplementation(async (entity) => entity as Order);

        const result = await service.updateStatus(
          50,
          OrderStatus.PREPARING,
          Role.MERCHANT,
        );

        expect(result.status).toBe(OrderStatus.PREPARING);
      });

      it('should allow merchant to transition from PREPARING to READY_FOR_PICKUP', async () => {
        const order = { ...mockOrder, status: OrderStatus.PREPARING };
        orderRepository.findOne.mockResolvedValue(order);
        orderRepository.save.mockImplementation(async (entity) => entity as Order);

        const result = await service.updateStatus(
          50,
          OrderStatus.READY_FOR_PICKUP,
          Role.MERCHANT,
        );

        expect(result.status).toBe(OrderStatus.READY_FOR_PICKUP);
      });

      it('should reject merchant illegal jump from PLACED directly to PREPARING or READY_FOR_PICKUP', async () => {
        orderRepository.findOne.mockResolvedValue({
          ...mockOrder,
          status: OrderStatus.PLACED,
        });

        await expect(
          service.updateStatus(50, OrderStatus.PREPARING, Role.MERCHANT),
        ).rejects.toThrow(BadRequestException);

        await expect(
          service.updateStatus(50, OrderStatus.READY_FOR_PICKUP, Role.MERCHANT),
        ).rejects.toThrow(BadRequestException);
      });

      it('should reject merchant illegal jump from ACCEPTED to READY_FOR_PICKUP or DECLINED', async () => {
        orderRepository.findOne.mockResolvedValue({
          ...mockOrder,
          status: OrderStatus.ACCEPTED,
        });

        await expect(
          service.updateStatus(50, OrderStatus.READY_FOR_PICKUP, Role.MERCHANT),
        ).rejects.toThrow(BadRequestException);

        await expect(
          service.updateStatus(50, OrderStatus.DECLINED, Role.MERCHANT),
        ).rejects.toThrow(BadRequestException);
      });

      it('should reject merchant attempting OUT_FOR_DELIVERY or DELIVERED', async () => {
        orderRepository.findOne.mockResolvedValue({
          ...mockOrder,
          status: OrderStatus.READY_FOR_PICKUP,
        });

        await expect(
          service.updateStatus(50, OrderStatus.OUT_FOR_DELIVERY, Role.MERCHANT),
        ).rejects.toThrow(BadRequestException);
      });
    });

    // Delivery Partner Transitions
    describe('DELIVERY_PARTNER role transitions', () => {
      it('should allow delivery partner to transition from READY_FOR_PICKUP to OUT_FOR_DELIVERY and assign driver ID', async () => {
        const order = { ...mockOrder, status: OrderStatus.READY_FOR_PICKUP };
        orderRepository.findOne.mockResolvedValue(order);
        orderRepository.save.mockImplementation(async (entity) => entity as Order);

        const result = await service.updateStatus(
          50,
          OrderStatus.OUT_FOR_DELIVERY,
          Role.DELIVERY_PARTNER,
          undefined,
          7, // Assigned delivery partner ID
        );

        expect(result.status).toBe(OrderStatus.OUT_FOR_DELIVERY);
        expect(result.deliveryPartnerId).toBe(7);
        expect(orderRepository.save).toHaveBeenCalledWith(
          expect.objectContaining({
            status: OrderStatus.OUT_FOR_DELIVERY,
            deliveryPartnerId: 7,
          }),
        );
      });

      it('should reject delivery partner transition to OUT_FOR_DELIVERY from invalid earlier states', async () => {
        const invalidPreStates = [
          OrderStatus.PLACED,
          OrderStatus.ACCEPTED,
          OrderStatus.PREPARING,
        ];

        for (const status of invalidPreStates) {
          orderRepository.findOne.mockResolvedValue({ ...mockOrder, status });
          await expect(
            service.updateStatus(
              50,
              OrderStatus.OUT_FOR_DELIVERY,
              Role.DELIVERY_PARTNER,
              undefined,
              7,
            ),
          ).rejects.toThrow(BadRequestException);
        }
      });

      it('should reject delivery partner transitioning to DELIVERED via updateStatus (must use OTP verifyDelivery)', async () => {
        orderRepository.findOne.mockResolvedValue({
          ...mockOrder,
          status: OrderStatus.OUT_FOR_DELIVERY,
          deliveryPartnerId: 7,
        });

        await expect(
          service.updateStatus(
            50,
            OrderStatus.DELIVERED,
            Role.DELIVERY_PARTNER,
          ),
        ).rejects.toThrow(BadRequestException);
      });
    });

    // Terminal States Permanence
    describe('Terminal states permanence', () => {
      const terminalStates = [
        OrderStatus.DELIVERED,
        OrderStatus.CANCELLED,
        OrderStatus.DECLINED,
      ];

      it('should reject any state transition out of terminal states across all roles', async () => {
        const allRoles = [Role.CUSTOMER, Role.MERCHANT, Role.DELIVERY_PARTNER];
        const allStatuses = Object.values(OrderStatus);

        for (const terminalState of terminalStates) {
          for (const role of allRoles) {
            orderRepository.findOne.mockResolvedValue({
              ...mockOrder,
              status: terminalState,
            });

            for (const targetStatus of allStatuses) {
              if (targetStatus === terminalState) continue; // idempotent case tested separately

              await expect(
                service.updateStatus(50, targetStatus, role),
              ).rejects.toThrow(BadRequestException);
            }
          }
        }
      });
    });

    // Unknown or Unauthorized Role
    it('should throw BadRequestException if an unsupported role tries to transition order', async () => {
      orderRepository.findOne.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.PLACED,
      });

      await expect(
        service.updateStatus(50, OrderStatus.ACCEPTED, 'ANONYMOUS' as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // =========================================================================
  // 4. Delivery OTP Verification (Dropoff security & courier checks)
  // =========================================================================
  describe('verifyDelivery', () => {
    const activeDeliveryOrder: Order = {
      ...mockOrder,
      status: OrderStatus.OUT_FOR_DELIVERY,
      deliveryPartnerId: 7,
      deliveryOtp: '4821',
    };

    it('should successfully complete delivery when valid OTP matches and courier is correctly assigned', async () => {
      orderRepository.findOne.mockResolvedValue({ ...activeDeliveryOrder });
      orderRepository.save.mockImplementation(async (entity) => entity as Order);

      const result = await service.verifyDelivery(50, 7, '4821');

      expect(result.status).toBe(OrderStatus.DELIVERED);
      expect(orderRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: OrderStatus.DELIVERED,
        }),
      );
    });

    it('should accept OTP with leading and trailing whitespace by trimming', async () => {
      orderRepository.findOne.mockResolvedValue({ ...activeDeliveryOrder });
      orderRepository.save.mockImplementation(async (entity) => entity as Order);

      const result = await service.verifyDelivery(50, 7, '  4821  ');

      expect(result.status).toBe(OrderStatus.DELIVERED);
    });

    it('should throw BadRequestException if order is not in OUT_FOR_DELIVERY status', async () => {
      const nonDeliveryStates = [
        OrderStatus.PLACED,
        OrderStatus.ACCEPTED,
        OrderStatus.PREPARING,
        OrderStatus.READY_FOR_PICKUP,
        OrderStatus.DELIVERED,
        OrderStatus.CANCELLED,
        OrderStatus.DECLINED,
      ];

      for (const status of nonDeliveryStates) {
        orderRepository.findOne.mockResolvedValue({
          ...activeDeliveryOrder,
          status,
        });

        await expect(service.verifyDelivery(50, 7, '4821')).rejects.toThrow(
          new BadRequestException(
            `Order #50 is currently in "${status}" status, not "${OrderStatus.OUT_FOR_DELIVERY}"`,
          ),
        );
      }
    });

    it('should throw ForbiddenException if delivery partner is not the one assigned to the order', async () => {
      orderRepository.findOne.mockResolvedValue({ ...activeDeliveryOrder });

      await expect(
        service.verifyDelivery(50, 999, '4821'), // Courier #999 != assigned #7
      ).rejects.toThrow(
        new ForbiddenException(
          'Delivery partner #999 is not assigned to order #50',
        ),
      );
      expect(orderRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if incorrect OTP is provided', async () => {
      orderRepository.findOne.mockResolvedValue({ ...activeDeliveryOrder });

      await expect(
        service.verifyDelivery(50, 7, '0000'), // Wrong OTP
      ).rejects.toThrow(
        new BadRequestException(
          'Invalid delivery verification OTP provided by customer',
        ),
      );
      expect(orderRepository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if order does not exist during verification', async () => {
      orderRepository.findOne.mockResolvedValue(null);

      await expect(service.verifyDelivery(999, 7, '4821')).rejects.toThrow(
        new NotFoundException('Order #999 not found'),
      );
    });
  });
});
