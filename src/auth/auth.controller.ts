import { Controller, Get, Post, Body, UsePipes, ValidationPipe, UseInterceptors, UploadedFile, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { LoginUserDto } from './dto/login-user.dto';
import { AccessTokenGuard } from './guards/accessToken.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registration')
  @UsePipes(new ValidationPipe())
  @UseInterceptors(FileInterceptor('photo'))
  registration(@Body() createUserDto: CreateUserDto, @UploadedFile() file: Express.Multer.File) {
    return this.authService.registration(createUserDto, file);
  }

  @Post('login')
  @UsePipes(new ValidationPipe())
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @UseGuards(AccessTokenGuard)
  @Get('logout')
  logout(@Req() req) {
    this.authService.logout(req.user['sub']);
  }
}
