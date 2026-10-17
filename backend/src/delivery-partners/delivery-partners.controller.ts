import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { DeliveryPartnersService } from './delivery-partners.service';
import { RegisterDeliveryPartnerDto } from './dtos/register-delivery-partner-dto';
import { UpdateDeliveryPartnerDto } from './dtos/update-delivery-partner-dto';
import { UpdateDutyDto } from './dtos/update-duty.dto';
import { UpdateLocationDto } from './dtos/update-location.dto';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { Roles } from '../authentication/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';

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

    @Patch('duty')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.DELIVERY_PARTNER)
    async updateDuty(@Req() req: any, @Body() updateDutyDto: UpdateDutyDto) {
        return await this.deliveryPartnersService.updateDutyStatus(req.user.id, updateDutyDto);
    }

    @Patch('location')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.DELIVERY_PARTNER)
    async updateLocation(@Req() req: any, @Body() updateLocationDto: UpdateLocationDto) {
        return await this.deliveryPartnersService.updateLocation(req.user.id, updateLocationDto);
    }
}

