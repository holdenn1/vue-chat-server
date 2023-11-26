import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { RefreshTokenGuard } from 'src/auth/guards/refreshToken.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(RefreshTokenGuard)
  @Get('search-users')
  searchUsersByNickname(@Query('nickname') nickname: string, @Req() req) {
    return this.userService.searchUsersByNickname(nickname, req.user.sub);
  }
}
