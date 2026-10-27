import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { OutletsService, CreateOutletDto, UpdateOutletDto } from './outlets.service';

@Controller('outlets')
export class OutletsController {
  constructor(private readonly outletsService: OutletsService) {}

  @Post('merchant/:merchantId')
  async createOutlet(
    @Param('merchantId', ParseIntPipe) merchantId: number,
    @Body() dto: CreateOutletDto,
  ) {
    return this.outletsService.createOutlet(merchantId, dto);
  }

  @Get('merchant/:merchantId')
  async getOutletsByMerchant(
    @Param('merchantId', ParseIntPipe) merchantId: number,
  ) {
    return this.outletsService.getOutletsByMerchantId(merchantId);
  }

  @Get(':id/storefront')
  async getOutletStorefront(
    @Param('id', ParseIntPipe) id: number,
    @Query('latitude') latitude?: string,
    @Query('longitude') longitude?: string,
  ) {
    const lat = latitude ? parseFloat(latitude) : undefined;
    const lng = longitude ? parseFloat(longitude) : undefined;
    const coords =
      lat !== undefined && !isNaN(lat) && lng !== undefined && !isNaN(lng)
        ? { latitude: lat, longitude: lng }
        : undefined;
    return this.outletsService.getOutletStorefront(id, coords);
  }

  @Get(':id')
  async getOutletById(@Param('id', ParseIntPipe) id: number) {
    return this.outletsService.getOutletById(id);
  }

  @Patch(':id')
  async updateOutlet(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOutletDto,
  ) {
    return this.outletsService.updateOutlet(id, dto);
  }
}
