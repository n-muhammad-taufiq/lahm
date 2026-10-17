import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryRequest } from './entities/delivery-request.entity';
import { DeliveryPartner } from '../delivery-partners/entities/delivery-partner.entity';
import { Order } from '../orders/entities/order.entity';
import { DeliveryAllocationService } from './delivery-allocation.service';
import { DeliveryAllocationController } from './delivery-allocation.controller';
import { DeliveryPartnersModule } from '../delivery-partners/delivery-partners.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeliveryRequest, DeliveryPartner, Order]),
    DeliveryPartnersModule,
  ],
  controllers: [DeliveryAllocationController],
  providers: [DeliveryAllocationService],
  exports: [DeliveryAllocationService],
})
export class DeliveryAllocationModule {}
