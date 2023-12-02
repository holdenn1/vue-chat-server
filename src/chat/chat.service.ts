import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { SendMessageDto } from './dto/send-message.dto';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { mapMessageToProfile } from './mappers';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class ChatService {
  constructor(
    private userService: UserService,
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

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

  async sendMessage(senderId: number, { recipientId, message }: SendMessageDto) {
    try {
      const sender = new User();
      sender.id = senderId;

      const receiver = new User();
      receiver.id = recipientId;

      const chat = await this.findOrCreateChat(sender, receiver);

      const createdMessage = await this.messageRepository.save({ message, chat, sender });
      return mapMessageToProfile(createdMessage);
    } catch (e) {
      console.error(e);
      throw new BadRequestException(`Something went wrong, message not sent`);
    }
  }

  async updateMessage(senderId: number, dto: UpdateMessageDto) {
    const finedMessage = await this.messageRepository.findOne({
      relations: { sender: true, chat: true },
      where: { id: dto.id },
    });

    if (finedMessage.sender.id !== senderId) {
      throw new ForbiddenException();
    }

    finedMessage.message = dto.message ?? finedMessage.message;
    finedMessage.isLike = dto.isLike ?? finedMessage.isLike;

    const updatedMessage = await this.messageRepository.save(finedMessage);

    return mapMessageToProfile(updatedMessage);
  }
}
