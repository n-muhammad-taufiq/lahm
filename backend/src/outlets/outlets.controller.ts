import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
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
