import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MerchantCategory } from './entities/merchant-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MerchantCategory])],
  exports: [TypeOrmModule],
})
export class MerchantCategoriesModule {}
