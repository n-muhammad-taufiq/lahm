import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class NearbyMerchantsQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(-90)
    @Max(90)
    latitude?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(-180)
    @Max(180)
    longitude?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0.5)
    @Max(100)
    radius?: number;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    search?: string;
}
