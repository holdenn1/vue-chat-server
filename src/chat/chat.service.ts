import { BadRequestException, Injectable } from '@nestjs/common';
import { SendMessageDto } from './dto/send-message.dto';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';

@Injectable()
export class ChatService {
  constructor(
    private userService: UserService,
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async findChatById(chatId: number) {
    return await this.chatRepository.findOne({ where: { id: chatId } });
  }

  async sendMessage(senderId: number,{recipientId, message }: SendMessageDto) {
    try {
      const sender = new User();
      sender.id = senderId;

      const receiver = new User();
      receiver.id = recipientId;

      const chat = await this.findOrCreateChat(sender, receiver);

      return await this.messageRepository.save({ message, chat, sender });
    } catch (e) {
      console.error(e);
      throw new BadRequestException(`Message not sent, check the data`);
    }
  }

  private async findOrCreateChat(sender: User, recipient: User): Promise<Chat> {
    const existingChat = await this.chatRepository
      .createQueryBuilder('chat')
      .leftJoin('chat.members', 'members')
      .where('members.id IN (:...userIds)', { userIds: [sender.id, recipient.id] })
      .groupBy('chat.id')
      .having('COUNT(DISTINCT members.id) = 2')
      .getOne();

    if (existingChat) {
      return existingChat;
    }

    return this.chatRepository.save({ members: [sender, recipient] });
  }
}
