import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryPartner } from './entities/delivery-partner.entity';
import { UsersModule } from 'src/users/users.module';
import { DeliveryPartnersService } from './delivery-partners.service';
import { DeliveryPartnersController } from './delivery-partners.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([DeliveryPartner]),
        UsersModule,
    ],
    controllers: [DeliveryPartnersController],
    providers: [DeliveryPartnersService],
    exports: [DeliveryPartnersService],
})
export class DeliveryPartnersModule {}