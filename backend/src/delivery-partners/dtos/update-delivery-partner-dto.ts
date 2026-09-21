import { IsOptional, IsString } from "class-validator";

export class UpdateDeliveryPartnerDto {
    // Personal Details
    @IsString()
    @IsOptional()
    dateOfBirth?: string;

    @IsString()
    @IsOptional()
    addressLine?: string;

    @IsString()
    @IsOptional()
    city?: string;

    @IsString()
    @IsOptional()
    state?: string;

    @IsString()
    @IsOptional()
    pinCode?: string;

    // Vehicle Details
    @IsString()
    @IsOptional()
    vehicleType?: string;

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

    // Payment Details
    @IsString()
    @IsOptional()
    accountHolderName?: string;

    @IsString()
    @IsOptional()
    bankAccountNumber?: string;

    @IsString()
    @IsOptional()
    ifsc?: string;

    @IsString()
    @IsOptional()
    bankName?: string;

    // Delivery Preferences
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
