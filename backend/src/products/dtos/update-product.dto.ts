import { Type } from "class-transformer";
import {
    IsBoolean,
    IsInt,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from "class-validator";

export class UpdateProductDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    photoUrl?: string;

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @IsOptional()
    price?: number;

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
    @IsOptional()
    merchantId?: number;
}
