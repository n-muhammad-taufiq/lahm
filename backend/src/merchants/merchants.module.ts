import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Merchant } from "./entities/merchant.entity";
import { UsersModule } from "src/users/users.module";
import { MerchantsService } from "./merchants.service";
import { MerchantsController } from "./merchants.controller";
import { AuthenticationModule } from "../authentication/authentication.module";

import { Product } from "../products/entities/product.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Merchant, Product]),
        UsersModule,
        AuthenticationModule,
    ],
    controllers: [MerchantsController],
    providers: [MerchantsService],
    exports: [MerchantsService]
})
export class MerchantsModule { }