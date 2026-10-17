import { Type } from "class-transformer";
import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
    ValidateNested,
} from "class-validator";
import { ProductVertical } from "../enums/product-vertical.enum";
import { MeatSpecies } from "../enums/meat-species.enum";
import { MeatCutType } from "../enums/meat-cut-type.enum";
import { BoneType } from "../enums/bone-type.enum";

export class CreateMeatProductDetailsDto {
    @IsEnum(MeatSpecies)
    @IsNotEmpty()
    species: MeatSpecies;

    @IsArray()
    @IsEnum(MeatCutType, { each: true })
    availableCuts: MeatCutType[];

    @IsArray()
    @IsEnum(BoneType, { each: true })
    availableBoneTypes: BoneType[];

    @IsArray()
    availableWeightsGrams: number[];

    @IsEnum(MeatCutType)
    @IsOptional()
    defaultCut?: MeatCutType;

    @IsEnum(BoneType)
    @IsOptional()
    defaultBoneType?: BoneType;

    @Type(() => Number)
    @IsInt()
    @IsOptional()
    defaultWeightGrams?: number;

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @IsOptional()
    bonelessExtraPrice?: number;

    @IsBoolean()
    @IsOptional()
    isZabihahHalal?: boolean;
}

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

    @IsEnum(ProductVertical)
    @IsNotEmpty()
    vertical: ProductVertical;

    @ValidateNested()
    @Type(() => CreateMeatProductDetailsDto)
    @IsOptional()
    meatDetails?: CreateMeatProductDetailsDto;
}
