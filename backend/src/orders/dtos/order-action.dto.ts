import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { OrderStatus } from '../enums/order-status.enum';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus, {
    message: `status must be a valid OrderStatus enum value (${Object.values(OrderStatus).join(', ')})`,
  })
  status: OrderStatus;

  @IsString()
  @IsOptional()
  cancellationReason?: string;
}

export class VerifyDeliveryOtpDto {
  @IsString()
  @IsNotEmpty()
  @Length(4, 4, { message: 'OTP must be exactly 4 digits' })
  @Matches(/^\d{4}$/, { message: 'OTP must contain only numbers' })
  otp: string;
}
