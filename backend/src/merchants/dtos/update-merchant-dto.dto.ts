import {
    IsArray,
    IsNumber,
    IsOptional,
    IsString,
} from "class-validator";

export class UpdateMerchantDto {
    // Shop Details
    @IsString()
    @IsOptional()
    shopName?: string;

    @IsString()
    @IsOptional()
    shopAddress?: string;

    @IsString()
    @IsOptional()
    city?: string;

    @IsString()
    @IsOptional()
    state?: string;

    @IsString()
    @IsOptional()
    pinCode?: string;

    @IsNumber()
    @IsOptional()
    latitude?: number;

    @IsNumber()
    @IsOptional()
    longitude?: number;

    @IsNumber()
    @IsOptional()
    rating?: number;

    @IsString()
    @IsOptional()
    bannerUrl?: string;

    // Business Verification
    @IsString()
    @IsOptional()
    halalCertificateUrl?: string;

    @IsString()
    @IsOptional()
    fssaiCertificateUrl?: string;

    @IsString()
    @IsOptional()
    gstin?: string;

    // Settlement Information
    @IsString()
    @IsOptional()
    accountHolderName?: string;

    @IsString()
    @IsOptional()
    bankName?: string;

    @IsString()
    @IsOptional()
    ifscCode?: string;

    // Store Operations & Timings
    @IsString()
    @IsOptional()
    openingTime?: string;

    @IsString()
    @IsOptional()
    closingTime?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    workingDays?: string[];
}
