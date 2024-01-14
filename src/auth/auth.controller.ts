import { Controller, Get, UseGuards, Req, Res, Post, UsePipes, ValidationPipe, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AccessTokenGuard } from './guards/accessToken.guard';
import { GoogleGuard } from './guards/google.guard';
import { RefreshTokenGuard } from './guards/refreshToken.guard';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private configService: ConfigService,
  ) {}

  sendCookie(res: Response, accessToken: string, refreshToken: string) {
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      expires: new Date(new Date().getTime() + 15 * 60 * 1000),
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      expires: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
    });
  }

  @Get('google')
  @UseGuards(GoogleGuard)
  async googleAuth(@Req() req) {}

  @Get('google/redirect')
  @UseGuards(GoogleGuard)
  async googleAuthRedirect(@Req() req, @Res({ passthrough: true }) res: Response) {
    const { user, accessToken, refreshToken } = await this.authService.googleAuth(req.user);
    this.sendCookie(res, accessToken, refreshToken);
    res.redirect(`${this.configService.get('CLIENT_URL')}/#/`);
  }

  @Post('registration')
  @UsePipes(new ValidationPipe())
  async registration(@Body() createUserDto: CreateUserDto, @Res({ passthrough: true }) res: Response) {
    const { user, accessToken, refreshToken } = await this.authService.registration(createUserDto);

    this.sendCookie(res, accessToken, refreshToken);
    return user;
  }

  @Post('login')
  @UsePipes(new ValidationPipe())
  async login(@Body() data: LoginUserDto, @Res({ passthrough: true }) res: Response) {
    const { user, accessToken, refreshToken } = await this.authService.login(data);

    this.sendCookie(res, accessToken, refreshToken);
    return user;
  }

  @UseGuards(AccessTokenGuard)
  @Get('logout')
  async logout(@Req() req, @Res({ passthrough: true }) res: Response) {
    const data = await this.authService.logout(req.user.sub);

    res.clearCookie('access_token', {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
    });

    res.clearCookie('refresh_token', {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
    });

    return { refreshToken: data.refreshToken };
  }

  @Get('token/refresh')
  @UseGuards(RefreshTokenGuard)
  async refreshTokens(@Req() req, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.authService.refreshTokens(
      req.user,
      req.cookies.refresh_token,
    );

    this.sendCookie(res, accessToken, refreshToken);
    return { accessToken, refreshToken };
  }

  @Get('token/refresh/refresh-login')
  @UseGuards(RefreshTokenGuard)
  async refreshTokensLogin(@Req() req, @Res({ passthrough: true }) res: Response) {
    const {
      user,
      tokens: { accessToken, refreshToken },
    } = await this.authService.refreshTokensLogin(req.user, req.cookies.refresh_token);

    this.sendCookie(res, accessToken, refreshToken);
    return user;
  }
}
