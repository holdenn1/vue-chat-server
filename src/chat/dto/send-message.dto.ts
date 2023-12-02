import { IsNumber, IsString } from 'class-validator';

export class SendMessageDto {
  @IsNumber()
  recipientId: number;
  @IsString()
  message: string;
}
