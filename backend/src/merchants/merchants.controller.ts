import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from "@nestjs/common";
import { MerchantsService } from "./merchants.service";
import { RegisterMerchantDto } from "./dtos/register-merchant-dto.dto";
import { UpdateMerchantDto } from "./dtos/update-merchant-dto.dto";
import { NearbyMerchantsQueryDto } from "./dtos/nearby-merchants-query.dto";

@Controller('merchant')
export class MerchantsController {
    constructor(private readonly merchantsService: MerchantsService) {}

    @Post('register')
    async register(@Body() registerMerchantDto: RegisterMerchantDto) {
        return this.merchantsService.register(registerMerchantDto);
    }

    @Get('nearby')
    async getNearby(@Query() query: NearbyMerchantsQueryDto) {
        return this.merchantsService.findNearby(query);
    }

    @Get('storefront/:id')
    async getStorefront(@Param('id', ParseIntPipe) id: number) {
        return this.merchantsService.getStorefront(id);
    }

    @Get(':id')
    async getById(@Param('id', ParseIntPipe) id: number) {
        return this.merchantsService.findById(id);
    }

    @Get('user/:userId')
    async getByUserId(@Param('userId', ParseIntPipe) userId: number) {
        return this.merchantsService.findByUserId(userId);
    }

    @Patch('user/:userId')
    async updateByUserId(
        @Param('userId', ParseIntPipe) userId: number,
        @Body() updateMerchantDto: UpdateMerchantDto,
    ) {
        return this.merchantsService.updateByUserId(userId, updateMerchantDto);
    }
}