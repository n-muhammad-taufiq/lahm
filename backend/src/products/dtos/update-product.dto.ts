import { Type } from "class-transformer";
import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsInt,
    IsNumber,
    IsOptional,
    IsString,
    Min,
    ValidateNested,
} from "class-validator";
import { MeatSpecies } from "../enums/meat-species.enum";
import { MeatCutType } from "../enums/meat-cut-type.enum";
import { BoneType } from "../enums/bone-type.enum";

export class UpdateMeatProductDetailsDto {
    @IsEnum(MeatSpecies)
    @IsOptional()
    species?: MeatSpecies;

    @IsArray()
    @IsEnum(MeatCutType, { each: true })
    @IsOptional()
    availableCuts?: MeatCutType[];

    @IsArray()
    @IsEnum(BoneType, { each: true })
    @IsOptional()
    availableBoneTypes?: BoneType[];

    @IsArray()
    @IsOptional()
    availableWeightsGrams?: number[];

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

    @ValidateNested()
    @Type(() => UpdateMeatProductDetailsDto)
    @IsOptional()
    meatDetails?: UpdateMeatProductDetailsDto;
}
