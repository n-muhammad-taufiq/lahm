import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Put,
    Query,
} from "@nestjs/common";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dtos/create-product.dto";
import { UpdateProductDto } from "./dtos/update-product.dto";

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Get()
    async findAll(@Query('merchantId') merchantId?: string) {
        if (merchantId) {
            return this.productsService.findByMerchantId(Number(merchantId));
        }
        return this.productsService.findAll();
    }

    @Get('merchant/:merchantId')
    async findByMerchantId(@Param('merchantId', ParseIntPipe) merchantId: number) {
        return this.productsService.findByMerchantId(merchantId);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.findById(id);
    }

    @Post()
    async create(@Body() createProductDto: CreateProductDto) {
        return this.productsService.create(createProductDto);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateProductDto: UpdateProductDto,
    ) {
        return this.productsService.update(id, updateProductDto);
    }

    @Put(':id')
    async updateWithPut(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateProductDto: UpdateProductDto,
    ) {
        return this.productsService.update(id, updateProductDto);
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.remove(id);
    }
}
