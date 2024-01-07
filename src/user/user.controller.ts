import {
  Body,
  Controller,
  Get,
  Headers,
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
import { SocketGateway } from 'src/socket/socket.gateway';
import { NotificationType } from 'src/socket/types';

@UseGuards(AccessTokenGuard)
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly socketGateway: SocketGateway,
  ) {}

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
  async updateUser(
    @Req() req,
    @Headers('socketId') socketId: string,
    @Body() updateUserDto: Partial<UpdateUserDto>,
  ) {
    const data = await this.userService.updateUser(+req.user.sub, updateUserDto);

    this.socketGateway.emitToAll(NotificationType.UPDATE_USER, {
      payload: data,
      socketId,
    });

    return data;
  }
}
