import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { DeliveryPartnersService } from './delivery-partners.service';
import { RegisterDeliveryPartnerDto } from './dtos/register-delivery-partner-dto';
import { UpdateDeliveryPartnerDto } from './dtos/update-delivery-partner-dto';

@Controller('delivery-partners')
export class DeliveryPartnersController {
    constructor(private readonly deliveryPartnersService: DeliveryPartnersService) { }

    @Post('register')
    async register(@Body() registerDeliveryPartnerDto: RegisterDeliveryPartnerDto) {
        return await this.deliveryPartnersService.register(registerDeliveryPartnerDto);
    }

    @Get('user/:userId')
    async getByUserId(@Param('userId', ParseIntPipe) userId: number) {
        return await this.deliveryPartnersService.findByUserId(userId);
    }

    @Patch('user/:userId')
    async updateByUserId(
        @Param('userId', ParseIntPipe) userId: number,
        @Body() updateDeliveryPartnerDto: UpdateDeliveryPartnerDto,
    ) {
        return await this.deliveryPartnersService.updateByUserId(userId, updateDeliveryPartnerDto);
    }
}

