import { Controller, Get, UseGuards, Req, Res, Post, UsePipes, ValidationPipe, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AccessTokenGuard } from './guards/accessToken.guard';
import { GoogleGuard } from './guards/google.guard';
import { RefreshTokenGuard } from './guards/refreshToken.guard';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(GoogleGuard)
  async googleAuth(@Req() req) {}

  @Get('google/redirect')
  @UseGuards(GoogleGuard)
  async googleAuthRedirect(@Req() req, @Res() res) {
    const { user, accessToken, refreshToken } = await this.authService.googleAuth(req.user);
    return user;
  }

  @Post('registration')
  @UsePipes(new ValidationPipe())
  async registration(@Body() createUserDto: CreateUserDto) {
    const { user, accessToken, refreshToken } = await this.authService.registration(createUserDto);
    return user;
  }

  @Post('login')
  @UsePipes(new ValidationPipe())
  async login(@Body() data: LoginUserDto) {
    const { user, accessToken, refreshToken } = await this.authService.login(data);
    return user;
  }

  @UseGuards(AccessTokenGuard)
  @Get('logout')
  logout(@Req() req) {
    this.authService.logout(req.user['sub']);
  }

  @Get('token/refresh')
  @UseGuards(RefreshTokenGuard)
  async refreshTokens(@Req() req) {
    const { accessToken, refreshToken } = await this.authService.refreshTokens(req.user);
  }

  @Get('token/refresh/refresh-login')
  @UseGuards(RefreshTokenGuard)
  async refreshTokensLogin(@Req() req) {
    const {
      user,
      tokens: { accessToken, refreshToken },
    } = await this.authService.refreshTokensLogin(req.user);
  }
}
