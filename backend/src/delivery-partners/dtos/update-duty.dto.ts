import { IsBoolean } from 'class-validator';

export class UpdateDutyDto {
  @IsBoolean()
  isOnline: boolean;
}
