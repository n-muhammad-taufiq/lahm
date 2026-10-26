import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationModule } from './authentication/authentication.module';
import { UsersModule } from './users/users.module';
import { CustomersModule } from './customers/customers.module';
import { DeliveryPartnersModule } from './delivery-partners/delivery-partners.module';
import { MerchantsModule } from './merchants/merchants.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { AddressesModule } from './addresses/addresses.module';
import { DeliveryAllocationModule } from './delivery-allocation/delivery-allocation.module';
import { MerchantCategoriesModule } from './merchant-categories/merchant-categories.module';
import { OutletsModule } from './outlets/outlets.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      ...(process.env.DB_URL
        ? { url: process.env.DB_URL }
        : {
            database: process.env.DB_NAME,
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
          }),
      synchronize: true,
      autoLoadEntities: true,
    }),
    AuthenticationModule,
    UsersModule,
    CustomersModule,
    DeliveryPartnersModule,
    MerchantsModule,
    ProductsModule,
    OrdersModule,
    AddressesModule,
    DeliveryAllocationModule,
    MerchantCategoriesModule,
    OutletsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
