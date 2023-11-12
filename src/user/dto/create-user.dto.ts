import { IsEmail, IsString, Matches } from 'class-validator';

export class CreateUserDto {
  @IsString()
  nickname: string;

  @IsEmail()
  email: string;

  @IsString()
  photo: string;

  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/, {
    message:
      'Password is required field.' +
      'Password must contain at least six characters.' +
      'Password must contain a letter, a number and one special character',
  })
  password: string;
}
