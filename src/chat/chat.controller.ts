import { Controller, Post, Body, UseGuards, UsePipes, ValidationPipe, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('send-message')
  @UseGuards(AccessTokenGuard)
  @UsePipes(new ValidationPipe())
  sendMessage(@Req() req, @Body() sendMessageDto: SendMessageDto) {
    return this.chatService.sendMessage(req.user.sub,sendMessageDto);
  }
}
