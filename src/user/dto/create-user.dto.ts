import { IsEmail, IsOptional, IsString, Matches } from 'class-validator';

export class CreateUserDto {
  @IsString()
  nickname: string;

  @IsEmail()
  email: string;

  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/, {
    message:
      'Password is required field.\n' +
      'Password must contain at least six characters.\n' +
      'Password must contain a letter, a number and one special character',
  })
  @IsOptional()
  password: string | null;

  @IsString()
  photo: string;
}
