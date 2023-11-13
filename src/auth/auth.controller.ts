import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AccessTokenGuard } from './guards/accessToken.guard';
import { GoogleGuard } from './guards/google.guard';
import { RefreshTokenGuard } from './guards/refreshToken.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(GoogleGuard)
  async googleAuth(@Req() req) {}

  @Get('google/redirect')
  @UseGuards(GoogleGuard)
  async googleAuthRedirect(@Req() req, @Res() res) {
    await this.authService.googleAuth(req.user, res);
  }

  @UseGuards(AccessTokenGuard)
  @Get('logout')
  logout(@Req() req) {
    this.authService.logout(req.user['sub']);
  }

  @Get('token/refresh')
  @UseGuards(RefreshTokenGuard)
  refreshTokens(@Req() req) {
    return this.authService.refreshTokens(req.user);
  }

  @Get('token/refresh/refresh-login')
  @UseGuards(RefreshTokenGuard)
  refreshTokensLogin(@Req() req) {
    return this.authService.refreshTokensLogin(req.user);
  }
}
