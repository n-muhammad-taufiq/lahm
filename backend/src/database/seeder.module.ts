import { Module } from '@nestjs/common';
import { AppModule } from '../app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Merchant } from '../merchants/entities/merchant.entity';
import { Product } from '../products/entities/product.entity';
import { MerchantCategory } from '../merchant-categories/entities/merchant-category.entity';
import { ProductCategory } from '../products/entities/product-category.entity';
import { Outlet } from '../outlets/entities/outlet.entity';
import { OutletProduct } from '../outlets/entities/outlet-product.entity';
import { SeederService } from './seeder.service';

@Module({
  imports: [
    AppModule,
    TypeOrmModule.forFeature([
      User,
      Merchant,
      Product,
      MerchantCategory,
      ProductCategory,
      Outlet,
      OutletProduct,
    ]),
  ],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}
