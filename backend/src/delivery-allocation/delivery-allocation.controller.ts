import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DeliveryAllocationService } from './delivery-allocation.service';
import { DeliveryPartnersService } from '../delivery-partners/delivery-partners.service';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { Roles } from '../authentication/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';

@Controller('delivery-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeliveryAllocationController {
  constructor(
    private readonly deliveryAllocationService: DeliveryAllocationService,
    private readonly deliveryPartnersService: DeliveryPartnersService,
  ) {}

  /**
   * Retrieves the active 20s serial delivery offer for the authenticated courier.
   * Mobile app polls this endpoint while on-duty.
   */
  @Get('incoming')
  @Roles(Role.DELIVERY_PARTNER)
  async getIncomingOffer(@Req() req: any) {
    const partner = await this.deliveryPartnersService.findByUserId(req.user.id);
    const offer = await this.deliveryAllocationService.getIncomingOffer(partner.id);
    return { offer };
  }

  /**
   * Retrieves Stage 2 (Open Radar Broadcast) delivery offers in proximity.
   */
  @Get('radar')
  @Roles(Role.DELIVERY_PARTNER)
  async getRadarOffers(@Req() req: any) {
    const partner = await this.deliveryPartnersService.findByUserId(req.user.id);
    const offers = await this.deliveryAllocationService.getRadarOffers(partner.id);
    return { offers };
  }

  /**
   * Atomically claims an incoming or broadcast delivery offer.
   */
  @Post(':id/accept')
  @Roles(Role.DELIVERY_PARTNER)
  async acceptOffer(
    @Param('id', ParseIntPipe) requestId: number,
    @Req() req: any,
  ) {
    const partner = await this.deliveryPartnersService.findByUserId(req.user.id);
    const assignedOrder = await this.deliveryAllocationService.acceptDeliveryRequest(
      requestId,
      partner.id,
    );
    return {
      message: 'Delivery offer accepted successfully',
      order: assignedOrder,
    };
  }

  /**
   * Declines a delivery offer and immediately cascades to the next candidate.
   */
  @Post(':id/reject')
  @Roles(Role.DELIVERY_PARTNER)
  async rejectOffer(
    @Param('id', ParseIntPipe) requestId: number,
    @Req() req: any,
  ) {
    const partner = await this.deliveryPartnersService.findByUserId(req.user.id);
    await this.deliveryAllocationService.handleRejection(requestId, partner.id);
    return {
      message: 'Delivery offer declined',
    };
  }
}
