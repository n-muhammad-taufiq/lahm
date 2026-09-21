import {
    IsArray,
    IsEmail,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from "class-validator";

export class RegisterMerchantDto {
    // Step 1: Personal Details
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    phoneNumber: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    password?: string;

    // Step 2: Shop Details
    @IsString()
    @IsOptional()
    shopName?: string;

    @IsString()
    @IsNotEmpty()
    shopAddress: string;

    @IsString()
    @IsNotEmpty()
    city: string;

    @IsString()
    @IsNotEmpty()
    state: string;

    @IsString()
    @IsNotEmpty()
    pinCode: string;

    @IsNumber()
    @IsOptional()
    latitude?: number;

    @IsNumber()
    @IsOptional()
    longitude?: number;

    @IsString()
    @IsOptional()
    bannerUrl?: string;

    // Step 3: Business Verification
    @IsString()
    @IsOptional()
    halalCertificateUrl?: string;

    @IsString()
    @IsOptional()
    fssaiCertificateUrl?: string;

    @IsString()
    @IsOptional()
    gstin?: string;

    // Step 4: Settlement Information
    @IsString()
    @IsNotEmpty()
    accountHolderName: string;

    @IsString()
    @IsNotEmpty()
    bankName: string;

    @IsString()
    @IsNotEmpty()
    ifscCode: string;

    // Step 5: Store Operations & Timings
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