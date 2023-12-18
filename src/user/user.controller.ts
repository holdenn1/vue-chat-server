import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RefreshTokenGuard } from 'src/auth/guards/refreshToken.guard';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserDto } from './dto/update-user.dto';

@UseGuards(AccessTokenGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('search-users')
  searchUsersByNickname(@Query('nickname') nickname: string, @Req() req) {
    return this.userService.searchUsersByNickname(nickname, req.user.sub);
  }

  @Get('user/:userId')
  getUserById(@Req() req, @Param('userId') userId: string) {
    return this.userService.findUserById(+userId);
  }

  @Post('update-user-avatar')
  @UseInterceptors(FileInterceptor('cover'))
  uploadAvatar(@Req() req, @UploadedFile() file: Express.Multer.File) {
    return this.userService.updateUserAvatar(file, +req.user.sub);
  }

  @Put('update-user')
  updateUser(@Req() req, @Body() updateUserDto: Partial<UpdateUserDto>) {
    return this.userService.updateUser(+req.user.sub, updateUserDto);
  }
}
