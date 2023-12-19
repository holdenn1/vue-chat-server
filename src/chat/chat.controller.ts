import {
  Controller,
  Post,
  Body,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Req,
  Put,
  Delete,
  Param,
  Get,
  Headers,
  Query,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { SocketGateway } from 'src/socket/socket.gateway';
import { NotificationType } from 'src/socket/types';

@UseGuards(AccessTokenGuard)
@UsePipes(new ValidationPipe())
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly socketGateway: SocketGateway,
  ) {}

  @Post('send-message')
  async sendMessage(
    @Req() req,
    @Body() sendMessageDto: SendMessageDto,

    @Headers('socketId') socketId: string,
  ) {
    const data = await this.chatService.sendMessage(+req.user.sub, sendMessageDto);
    this.socketGateway.emitToAll(NotificationType.SEND_MESSAGE, { payload: data, socketId });
    return data;
  }

  @Put('update-message')
  async updateMessage(@Req() req, @Body() updateMessage: UpdateMessageDto) {
    const updatedMessage = await this.chatService.updateMessage(+req.user.sub, updateMessage);
    return updatedMessage;
  }

  @Delete('remove-message/:messageId')
  async removeMessage(@Req() req, @Param('messageId') messageId: string) {
    const message = await this.chatService.removeMessage(+req.user.sub, +messageId);
    return message;
  }

  @Delete('remove-chat/:recipientId')
  async removeChat(@Req() req, @Param('recipientId') recipientId: string) {
    const chat = await this.chatService.removeChat(+req.user.sub, +recipientId);
    return chat;
  }

  @Get('get-chats')
  async getUserChats(@Req() req, @Query('page') page: string, @Query('pageSize') pageSize: string) {
    return this.chatService.findChatsByUser(+req.user.sub, +page, +pageSize);
  }

  @Get('get-messages/:chatId')
  async getMessages(
    @Req() req,
    @Param('chatId') chatId: string,
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.chatService.getMessages(+req.user.sub, +chatId, +page, +pageSize);
  }
}
