import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateOrderItemDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  merchantId: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @IsString()
  @IsNotEmpty()
  deliveryAddress: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  deliveryLatitude?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  deliveryLongitude?: number;
}
