import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { RefreshTokenGuard } from 'src/auth/guards/refreshToken.guard';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AccessTokenGuard)
  @Get('search-users')
  searchUsersByNickname(@Query('nickname') nickname: string, @Req() req) {
    return this.userService.searchUsersByNickname(nickname, req.user.sub);
  }

  @Get('user/:userId')
  getUserById(@Req() req, @Param('userId') userId: string) {
    return this.userService.findUserById(+userId);
  }
}
