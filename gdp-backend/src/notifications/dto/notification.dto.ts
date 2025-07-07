import { IsNotEmpty, IsBoolean, IsString, IsOptional, IsInt } from 'class-validator';

export class CreateNotificationDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  message: string;
}

export class UpdateNotificationDto {
  @IsBoolean()
  @IsOptional()
  isRead?: boolean;
}
