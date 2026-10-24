import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "./entities/product.entity";
import { MeatProductDetails } from "./entities/meat-product-details.entity";
import { CustomizationGroup } from "./entities/customization-group.entity";
import { CustomizationOption } from "./entities/customization-option.entity";
import { ProductCategory } from "./entities/product-category.entity";
import { ProductsService } from "./products.service";
import { ProductsController } from "./products.controller";
import { MerchantsModule } from "../merchants/merchants.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Product,
            MeatProductDetails,
            CustomizationGroup,
            CustomizationOption,
            ProductCategory,
        ]),
        MerchantsModule,
    ],
    controllers: [ProductsController],
    providers: [ProductsService],
    exports: [ProductsService],
})
export class ProductsModule {}
