import { IsEmail, IsString, Matches } from 'class-validator';

export class CreateUserDto {
  @IsString()
  nickname: string;

  @IsEmail()
  email: string;

  @IsString()
  photo: string;
}
