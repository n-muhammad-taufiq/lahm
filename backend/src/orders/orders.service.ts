import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Merchant } from '../merchants/entities/merchant.entity';
import { Product } from '../products/entities/product.entity';
import { Outlet } from '../outlets/entities/outlet.entity';
import { OutletProduct } from '../outlets/entities/outlet-product.entity';
import { CreateOrderDto } from './dtos/create-order.dto';
import { OrderStatus } from './enums/order-status.enum';
import { Role } from '../users/enums/role.enum';
import { calculateHaversineDistance } from '../common/utils/geo.util';
import { DeliveryAllocationService } from '../delivery-allocation/delivery-allocation.service';
import {
  DEFAULT_PLATFORM_FEE,
  DEFAULT_PRICING_CONFIG,
  DeliveryPricingConfig,
} from './constants/pricing.constants';

export function generateDeliveryOtp(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Outlet)
    private readonly outletRepository: Repository<Outlet>,
    @InjectRepository(OutletProduct)
    private readonly outletProductRepository: Repository<OutletProduct>,
    private readonly dataSource: DataSource,
    @Optional()
    private readonly deliveryAllocationService?: DeliveryAllocationService,
  ) {}

  calculateDeliveryFee(
    distanceKm: number | null,
    config: DeliveryPricingConfig = DEFAULT_PRICING_CONFIG,
  ): number {
    if (distanceKm === null) {
      return config.baseFare;
    }

    if (distanceKm < 0) {
      throw new BadRequestException('Distance cannot be negative');
    }

    if (distanceKm === 0) {
      return config.baseFare;
    }

    const extraKm = Math.max(0, distanceKm - config.baseKm);
    return (
      Math.round((config.baseFare + extraKm * config.perKmRate) * 100) / 100
    );
  }

  async create(
    customerId: number,
    createOrderDto: CreateOrderDto,
  ): Promise<Order> {
    const {
      merchantId,
      outletId,
      items,
      deliveryAddress,
      deliveryLatitude,
      deliveryLongitude,
    } = createOrderDto;

    if (!items || items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    // 1. Validate Customer
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });
    if (!customer) {
      throw new NotFoundException(`Customer #${customerId} not found`);
    }

    // 2. Validate Merchant
    const merchant = await this.merchantRepository.findOne({
      where: { id: merchantId },
    });
    if (!merchant) {
      throw new NotFoundException(`Merchant #${merchantId} not found`);
    }

    // 3. Validate Outlet (if provided)
    let resolvedOutlet: Outlet | null = null;
    if (outletId) {
      resolvedOutlet = await this.outletRepository.findOne({
        where: { id: outletId },
      });
      if (!resolvedOutlet) {
        throw new NotFoundException(`Outlet #${outletId} not found`);
      }
      if (resolvedOutlet.merchantId !== merchantId) {
        throw new BadRequestException(
          `Outlet #${outletId} does not belong to merchant #${merchantId}`,
        );
      }
      if (!resolvedOutlet.isActive) {
        throw new BadRequestException(
          `Outlet #${outletId} (${resolvedOutlet.name}) is currently closed or inactive`,
        );
      }
    }

    // 4. Batch-fetch products & outlet-specific overrides
    const productIds = items.map((i) => i.productId);
    const products = await this.productRepository.find({
      where: { id: In(productIds) },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException(
        'One or more products in the order could not be found',
      );
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    let outletProductMap = new Map<number, OutletProduct>();
    if (outletId) {
      const outletProducts = await this.outletProductRepository.find({
        where: { outletId, productId: In(productIds) },
      });
      outletProductMap = new Map(
        outletProducts.map((op) => [op.productId, op]),
      );
    }

    // 5. Validate products and calculate server-authoritative subtotal
    let subtotal = 0;
    const orderItemEntities: Partial<OrderItem>[] = [];

    for (const itemDto of items) {
      const product = productMap.get(itemDto.productId)!;

      if (product.merchantId !== merchantId) {
        throw new BadRequestException(
          `Product #${product.id} (${product.name}) does not belong to merchant #${merchantId}`,
        );
      }

      const outletProduct = outletProductMap.get(itemDto.productId);
      if (outletProduct) {
        if (outletProduct.isAvailable === false) {
          throw new BadRequestException(
            `Product #${product.id} (${product.name}) is currently out of stock at ${resolvedOutlet?.name || 'this branch'}`,
          );
        }
        if (outletProduct.stockQuantity < itemDto.quantity) {
          throw new BadRequestException(
            `Insufficient stock for Product #${product.id} (${product.name}) at ${resolvedOutlet?.name || 'this branch'}`,
          );
        }
      } else if (product.isAvailable === false) {
        throw new BadRequestException(
          `Product #${product.id} (${product.name}) is currently out of stock`,
        );
      }

      const unitPrice =
        outletProduct?.priceOverride !== undefined &&
        outletProduct?.priceOverride !== null
          ? Number(outletProduct.priceOverride)
          : Number(product.price);

      const totalPrice =
        Math.round(unitPrice * itemDto.quantity * 100) / 100;
      subtotal += totalPrice;

      orderItemEntities.push({
        productId: product.id,
        productName: product.name,
        unitPrice,
        quantity: itemDto.quantity,
        totalPrice,
      });
    }

    subtotal = Math.round(subtotal * 100) / 100;

    // 6. Calculate Haversine distance and dynamic delivery fee anchored to outlet coords
    const originLat = resolvedOutlet ? resolvedOutlet.latitude : merchant.latitude;
    const originLng = resolvedOutlet ? resolvedOutlet.longitude : merchant.longitude;

    let distanceKm: number | null = null;
    if (
      originLat != null &&
      originLng != null &&
      deliveryLatitude != null &&
      deliveryLongitude != null
    ) {
      distanceKm = calculateHaversineDistance(
        originLat,
        originLng,
        deliveryLatitude,
        deliveryLongitude,
      );
    }

    const deliveryFee = this.calculateDeliveryFee(distanceKm);
    const platformFee = DEFAULT_PLATFORM_FEE;
    const total =
      Math.round((subtotal + deliveryFee + platformFee) * 100) / 100;
    const deliveryOtp = generateDeliveryOtp();

    // 7. Execute atomic transaction
    return this.dataSource.transaction(async (manager) => {
      const order = manager.create(Order, {
        customerId,
        merchantId,
        outletId: resolvedOutlet?.id ?? undefined,
        status: OrderStatus.PLACED,
        subtotal,
        deliveryFee,
        platformFee,
        total,
        deliveryAddress,
        deliveryLatitude,
        deliveryLongitude,
        distanceKm: distanceKm ?? undefined,
        deliveryOtp,
      });

      const savedOrder = await manager.save(Order, order);

      const itemsToSave = orderItemEntities.map((item) =>
        manager.create(OrderItem, {
          ...item,
          orderId: savedOrder.id,
        }),
      );

      savedOrder.items = await manager.save(OrderItem, itemsToSave);
      return savedOrder;
    });
  }

  async findById(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: {
        items: {
          product: true,
        },
        customer: {
          user: true,
        },
        merchant: true,
        outlet: true,
        deliveryPartner: {
          user: true,
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }

    return order;
  }

  async findByCustomerId(customerId: number): Promise<Order[]> {
    return this.orderRepository.find({
      where: { customerId },
      relations: {
        items: {
          product: true,
        },
        merchant: true,
        outlet: true,
        deliveryPartner: {
          user: true,
        },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findByMerchantId(
    merchantId: number,
    outletId?: number,
  ): Promise<Order[]> {
    const where: any = { merchantId };
    if (outletId) {
      where.outletId = outletId;
    }

    return this.orderRepository.find({
      where,
      relations: {
        items: {
          product: true,
        },
        customer: {
          user: true,
        },
        outlet: true,
        deliveryPartner: {
          user: true,
        },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findByDeliveryPartnerId(
    deliveryPartnerId: number,
  ): Promise<Order[]> {
    return this.orderRepository.find({
      where: { deliveryPartnerId },
      relations: {
        items: {
          product: true,
        },
        customer: {
          user: true,
        },
        merchant: true,
        outlet: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(
    id: number,
    newStatus: OrderStatus,
    role: Role,
    cancellationReason?: string,
    deliveryPartnerId?: number,
  ): Promise<Order> {
    const order = await this.findById(id);
    const currentStatus = order.status;

    if (currentStatus === newStatus) {
      return order;
    }

    const allowedTransitions: Record<
      Role,
      Partial<Record<OrderStatus, OrderStatus[]>>
    > = {
      [Role.CUSTOMER]: {
        [OrderStatus.PLACED]: [OrderStatus.CANCELLED],
      },
      [Role.MERCHANT]: {
        [OrderStatus.PLACED]: [OrderStatus.ACCEPTED, OrderStatus.DECLINED],
        [OrderStatus.ACCEPTED]: [OrderStatus.PREPARING],
        [OrderStatus.PREPARING]: [OrderStatus.READY_FOR_PICKUP],
      },
      [Role.DELIVERY_PARTNER]: {
        [OrderStatus.READY_FOR_PICKUP]: [OrderStatus.OUT_FOR_DELIVERY],
      },
    };

    const roleTransitions =
      allowedTransitions[role]?.[currentStatus] ?? [];
    if (!roleTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Role "${role}" cannot transition order #${id} from "${currentStatus}" to "${newStatus}"`,
      );
    }

    order.status = newStatus;
    if (newStatus === OrderStatus.CANCELLED && cancellationReason) {
      order.cancellationReason = cancellationReason;
    }
    if (newStatus === OrderStatus.OUT_FOR_DELIVERY && deliveryPartnerId) {
      order.deliveryPartnerId = deliveryPartnerId;
    }

    const savedOrder = await this.orderRepository.save(order);

    // Trigger delivery partner dispatch when merchant begins preparing food
    if (newStatus === OrderStatus.PREPARING && this.deliveryAllocationService) {
      this.deliveryAllocationService
        .dispatchOrder(savedOrder.id)
        .catch((err: any) => {
          this.logger.error(
            `Failed to dispatch order #${savedOrder.id}: ${err.message}`,
            err.stack,
          );
        });
    }

    return savedOrder;
  }

  async verifyDelivery(
    orderId: number,
    deliveryPartnerId: number,
    otp: string,
  ): Promise<Order> {
    const order = await this.findById(orderId);

    if (order.status !== OrderStatus.OUT_FOR_DELIVERY) {
      throw new BadRequestException(
        `Order #${orderId} is currently in "${order.status}" status, not "${OrderStatus.OUT_FOR_DELIVERY}"`,
      );
    }

    if (order.deliveryPartnerId !== deliveryPartnerId) {
      throw new ForbiddenException(
        `Delivery partner #${deliveryPartnerId} is not assigned to order #${orderId}`,
      );
    }

    if (order.deliveryOtp !== otp.trim()) {
      throw new BadRequestException(
        'Invalid delivery verification OTP provided by customer',
      );
    }

    order.status = OrderStatus.DELIVERED;
    return this.orderRepository.save(order);
  }
}
