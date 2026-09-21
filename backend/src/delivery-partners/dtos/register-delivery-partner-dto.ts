import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class RegisterDeliveryPartnerDto {
    // Step 1: Basic Details
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

    // Step 2: Personal Details
    @IsString()
    @IsOptional()
    dateOfBirth?: string;

    @IsString()
    @IsNotEmpty()
    addressLine: string;

    @IsString()
    @IsNotEmpty()
    city: string;

    @IsString()
    @IsNotEmpty()
    state: string;

    @IsString()
    @IsNotEmpty()
    pinCode: string;

    // Step 3: Vehicle Details
    @IsString()
    @IsNotEmpty()
    vehicleType: string; // 'motorcycle' | 'scooter' | 'bicycle'

    @IsString()
    @IsOptional()
    vehicleRegistrationNumber?: string;

    @IsString()
    @IsOptional()
    drivingLicenseNumber?: string;

    @IsString()
    @IsOptional()
    drivingLicensePhotoUrl?: string;

    @IsString()
    @IsOptional()
    vehicleRcPhotoUrl?: string;

    // Step 4: Payment Details
    @IsString()
    @IsNotEmpty()
    accountHolderName: string;

    @IsString()
    @IsNotEmpty()
    bankAccountNumber: string;

    @IsString()
    @IsNotEmpty()
    ifsc: string;

    @IsString()
    @IsNotEmpty()
    bankName: string;

    // Step 5: Delivery Preferences
    @IsString()
    @IsOptional()
    preferredDeliveryArea?: string;

    @IsString()
    @IsOptional()
    workingHours?: string;

    @IsString()
    @IsOptional()
    maxDeliveryRadiusKm?: string;
}