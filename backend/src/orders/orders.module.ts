import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Merchant } from '../merchants/entities/merchant.entity';
import { Product } from '../products/entities/product.entity';
import { DeliveryPartner } from '../delivery-partners/entities/delivery-partner.entity';
import { Outlet } from '../outlets/entities/outlet.entity';
import { OutletProduct } from '../outlets/entities/outlet-product.entity';
import { DeliveryAllocationModule } from '../delivery-allocation/delivery-allocation.module';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      Customer,
      Merchant,
      Product,
      DeliveryPartner,
      Outlet,
      OutletProduct,
    ]),
    DeliveryAllocationModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
