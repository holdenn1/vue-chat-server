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
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@UseGuards(AccessTokenGuard)
@UsePipes(new ValidationPipe())
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('send-message')
  async sendMessage(@Req() req, @Body() sendMessageDto: SendMessageDto) {
    const message = await this.chatService.sendMessage(+req.user.sub, sendMessageDto);
    return message;
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
}
