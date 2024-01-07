import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateMessageDto {
  @IsNumber()
  id: number;
  @IsString()
  @IsOptional()
  message: string;
  @IsBoolean()
  @IsOptional()
  isLike:boolean
  @IsNumber()
  recipientId: number
}
