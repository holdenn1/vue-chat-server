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
import { MessageToProfile, SendMessageResponse } from './types';

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
    const data: SendMessageResponse = await this.chatService.sendMessage(+req.user.sub, sendMessageDto);

    this.socketGateway.emitNotification(data.recipientId, NotificationType.SEND_MESSAGE, {
      payload: data,
      socketId,
    });
    return data;
  }

  @Put('update-message')
  async updateMessage(
    @Req() req,
    @Headers('socketId') socketId: string,
    @Body() updateMessage: UpdateMessageDto,
  ) {
    const updatedMessage: MessageToProfile = await this.chatService.updateMessage(
      +req.user.sub,
      updateMessage,
    );

    this.socketGateway.emitNotification(updateMessage.recipientId, NotificationType.UPDATE_MESSAGE, {
      payload: updatedMessage,
      socketId,
    });
    return updatedMessage;
  }

  @Delete('remove-message/:messageId/:recipientId')
  async removeMessage(
    @Req() req,
    @Headers('socketId') socketId: string,
    @Param('messageId') messageId: string,
    @Param('recipientId') recipientId: string,
  ) {
    const message = await this.chatService.removeMessage(+req.user.sub, +messageId);
    this.socketGateway.emitNotification(+recipientId, NotificationType.REMOVE_MESSAGE, {
      payload: message,
      socketId,
    });
    return message;
  }

  @Delete('remove-chat/:chatId')
  async removeChat(@Req() req, @Headers('socketId') socketId: string, @Param('chatId') chatId: string) {
    const data = await this.chatService.removeChat(+req.user.sub, +chatId);

    const recipient = data.members.find((user) => user.id !== +req.user.sub);
    if (recipient) {
      this.socketGateway.emitNotification(recipient.id, NotificationType.REMOVE_CHAT, {
        payload: data,
        socketId,
      });
    }

    return { chatId: data.id };
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
