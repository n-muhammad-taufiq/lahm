import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dtos/create-order.dto';
import {
  UpdateOrderStatusDto,
  VerifyDeliveryOtpDto,
} from './dtos/order-action.dto';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { Roles } from '../authentication/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { Customer } from '../customers/entities/customer.entity';
import { Merchant } from '../merchants/entities/merchant.entity';
import { DeliveryPartner } from '../delivery-partners/entities/delivery-partner.entity';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    @InjectRepository(DeliveryPartner)
    private readonly deliveryPartnerRepository: Repository<DeliveryPartner>,
  ) {}

  @Post()
  @Roles(Role.CUSTOMER)
  async create(@Req() req: any, @Body() createOrderDto: CreateOrderDto) {
    const customer = await this.customerRepository.findOne({
      where: { user: { id: req.user.id } },
    });
    if (!customer) {
      throw new ForbiddenException(
        'Authenticated user is not registered as a customer',
      );
    }
    return this.ordersService.create(customer.id, createOrderDto);
  }

  @Get('customer/my-orders')
  @Roles(Role.CUSTOMER)
  async getCustomerOrders(@Req() req: any) {
    const customer = await this.customerRepository.findOne({
      where: { user: { id: req.user.id } },
    });
    if (!customer) {
      throw new ForbiddenException(
        'Authenticated user is not registered as a customer',
      );
    }
    return this.ordersService.findByCustomerId(customer.id);
  }

  @Get('merchant/:merchantId')
  @Roles(Role.MERCHANT)
  async getMerchantOrders(
    @Param('merchantId', ParseIntPipe) merchantId: number,
    @Query('outletId') outletIdQuery: string | undefined,
    @Req() req: any,
  ) {
    const merchant = await this.merchantRepository.findOne({
      where: { user: { id: req.user.id } },
    });
    if (!merchant) {
      throw new ForbiddenException(
        'Authenticated user is not registered as a merchant',
      );
    }
    if (merchant.id !== merchantId) {
      throw new ForbiddenException(
        'You can only access orders for your own merchant store',
      );
    }
    const outletId = outletIdQuery ? parseInt(outletIdQuery, 10) : undefined;
    return this.ordersService.findByMerchantId(merchantId, outletId);
  }

  @Get('delivery-partner/my-orders')
  @Roles(Role.DELIVERY_PARTNER)
  async getDeliveryPartnerOrders(@Req() req: any) {
    const partner = await this.deliveryPartnerRepository.findOne({
      where: { user: { id: req.user.id } },
    });
    if (!partner) {
      throw new ForbiddenException(
        'Authenticated user is not registered as a delivery partner',
      );
    }
    return this.ordersService.findByDeliveryPartnerId(partner.id);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const order = await this.ordersService.findById(id);
    const user = req.user;

    if (user.role === Role.CUSTOMER && order.customer?.user?.id !== user.id) {
      throw new ForbiddenException(
        'You cannot access orders belonging to other customers',
      );
    }
    if (user.role === Role.MERCHANT && order.merchant?.user?.id !== user.id) {
      throw new ForbiddenException(
        'You cannot access orders for other merchant stores',
      );
    }
    if (
      user.role === Role.DELIVERY_PARTNER &&
      order.deliveryPartnerId &&
      order.deliveryPartner?.user?.id !== user.id
    ) {
      throw new ForbiddenException(
        'You cannot access orders assigned to other couriers',
      );
    }

    return order;
  }

  @Patch(':id/status')
  @Roles(Role.CUSTOMER, Role.MERCHANT, Role.DELIVERY_PARTNER)
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateOrderStatusDto,
    @Req() req: any,
  ) {
    const order = await this.ordersService.findById(id);

    if (req.user.role === Role.CUSTOMER) {
      const customer = await this.customerRepository.findOne({
        where: { user: { id: req.user.id } },
      });
      if (!customer) {
        throw new ForbiddenException(
          'Authenticated user is not registered as a customer',
        );
      }
      if (order.customerId !== customer.id) {
        throw new ForbiddenException(
          'You can only update your own orders',
        );
      }
    }

    if (req.user.role === Role.MERCHANT) {
      const merchant = await this.merchantRepository.findOne({
        where: { user: { id: req.user.id } },
      });
      if (!merchant) {
        throw new ForbiddenException(
          'Authenticated user is not registered as a merchant',
        );
      }
      if (order.merchantId !== merchant.id) {
        throw new ForbiddenException(
          'You can only update orders for your own merchant store',
        );
      }
    }

    let deliveryPartnerId: number | undefined;
    if (req.user.role === Role.DELIVERY_PARTNER) {
      const partner = await this.deliveryPartnerRepository.findOne({
        where: { user: { id: req.user.id } },
      });
      if (!partner) {
        throw new ForbiddenException(
          'Authenticated user is not registered as a delivery partner',
        );
      }
      deliveryPartnerId = partner.id;
    }

    return this.ordersService.updateStatus(
      id,
      updateDto.status,
      req.user.role,
      updateDto.cancellationReason,
      deliveryPartnerId,
    );
  }

  @Post(':id/verify-delivery')
  @Roles(Role.DELIVERY_PARTNER)
  async verifyDelivery(
    @Param('id', ParseIntPipe) id: number,
    @Body() verifyDto: VerifyDeliveryOtpDto,
    @Req() req: any,
  ) {
    const partner = await this.deliveryPartnerRepository.findOne({
      where: { user: { id: req.user.id } },
    });
    if (!partner) {
      throw new ForbiddenException(
        'Authenticated user is not registered as a delivery partner',
      );
    }
    return this.ordersService.verifyDelivery(id, partner.id, verifyDto.otp);
  }
}
