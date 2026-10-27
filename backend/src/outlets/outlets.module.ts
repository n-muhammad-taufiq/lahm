import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Outlet } from './entities/outlet.entity';
import { OutletProduct } from './entities/outlet-product.entity';
import { Merchant } from '../merchants/entities/merchant.entity';
import { Product } from '../products/entities/product.entity';
import { OutletsService } from './outlets.service';
import { OutletsController } from './outlets.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Outlet, OutletProduct, Merchant, Product])],
  controllers: [OutletsController],
  providers: [OutletsService],
  exports: [OutletsService],
})
export class OutletsModule {}
