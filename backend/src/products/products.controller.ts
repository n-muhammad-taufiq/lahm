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
    UseGuards,
} from "@nestjs/common";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dtos/create-product.dto";
import { UpdateProductDto } from "./dtos/update-product.dto";
import { JwtAuthGuard } from "../authentication/guards/jwt-auth.guard";
import { RolesGuard } from "../authentication/guards/roles.guard";
import { Roles } from "../authentication/decorators/roles.decorator";
import { Role } from "../users/enums/role.enum";

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

    @Get('merchant/:merchantId/categories')
    async getMerchantCategories(
        @Param('merchantId', ParseIntPipe) merchantId: number,
        @Query('parentId') parentId?: string,
        @Query('tree') tree?: string,
    ) {
        const parsedParentId =
            parentId !== undefined && parentId !== '' && !isNaN(Number(parentId))
                ? Number(parentId)
                : undefined;
        const isTree = tree === 'true' || tree === '1';
        return this.productsService.getMerchantCategories(merchantId, parsedParentId, isTree);
    }

    @Get('merchant/:merchantId/catalog')
    async getMerchantCatalog(
        @Param('merchantId', ParseIntPipe) merchantId: number,
        @Query('categoryId') categoryId?: string,
        @Query('search') search?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.productsService.getMerchantCatalog(merchantId, {
            categoryId:
                categoryId !== undefined && categoryId !== '' && !isNaN(Number(categoryId))
                    ? Number(categoryId)
                    : undefined,
            search,
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
        });
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.findById(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.MERCHANT)
    async create(@Body() createProductDto: CreateProductDto) {
        return this.productsService.create(createProductDto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.MERCHANT)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateProductDto: UpdateProductDto,
    ) {
        return this.productsService.update(id, updateProductDto);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.MERCHANT)
    async updateWithPut(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateProductDto: UpdateProductDto,
    ) {
        return this.productsService.update(id, updateProductDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.MERCHANT)
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.remove(id);
    }
}
