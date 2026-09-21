import { Type } from "class-transformer";
import {
    IsBoolean,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from "class-validator";

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    photoUrl?: string;

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    price: number;

    @Type(() => Number)
    @IsInt()
    @Min(0)
    @IsOptional()
    stock?: number;

    @IsBoolean()
    @IsOptional()
    isAvailable?: boolean;

    @Type(() => Number)
    @IsInt()
    @IsNotEmpty()
    merchantId: number;
}
