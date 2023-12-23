import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { SendMessageDto } from './dto/send-message.dto';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { mapChatToProfile, mapChatsToProfile, mapMessageToProfile, mapMessagesToProfile } from './mappers';
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

  async findMessage(messageId) {
    return await this.messageRepository.findOne({
      relations: { sender: true, chat: true },
      where: { id: messageId },
    });
  }

  async findChat(sender: User, recipient: User) {
    return await this.chatRepository
      .createQueryBuilder('chat')
      .leftJoin('chat.members', 'members')
      .where('members.id IN (:...userIds)', { userIds: [sender.id, recipient.id] })
      .groupBy('chat.id')
      .having('COUNT(DISTINCT members.id) = 2')
      .getOne();
  }

  async findOrCreateChat(sender: User, recipient: User): Promise<Chat> {
    const existingChat = await this.findChat(sender, recipient);

    if (existingChat) {
      existingChat.updatedDate = new Date();
      return await this.chatRepository.save(existingChat);
    }

    return this.chatRepository.save({ members: [sender, recipient] });
  }

  async sendMessage(senderId: number, { recipientId, message }: SendMessageDto) {
    try {
      const sender = new User();
      sender.id = senderId;

      const recipient = new User();
      recipient.id = recipientId;

      const chat = await this.findOrCreateChat(sender, recipient);

      const createdMessage = await this.messageRepository.save({ message, chat, sender });
      return { chat: mapChatToProfile(chat), message: mapMessageToProfile(createdMessage) ,recipientId};
    } catch (e) {
      console.error(e);
      throw new BadRequestException(`Something went wrong, message not sent`);
    }
  }

  async updateMessage(senderId: number, dto: UpdateMessageDto) {
    const finedMessage = await this.findMessage(dto.id);

    if (finedMessage.sender.id !== senderId) {
      throw new ForbiddenException();
    }

    finedMessage.message = dto.message ?? finedMessage.message;
    finedMessage.isLike = dto.isLike ?? finedMessage.isLike;

    const updatedMessage = await this.messageRepository.save(finedMessage);

    return mapMessageToProfile(updatedMessage);
  }

  async removeMessage(userId: number, messageId: number) {
    const message = await this.findMessage(messageId);

    if (message.sender.id !== userId) {
      throw new ForbiddenException();
    }

    const removedMessage = await this.messageRepository.remove(message);

    return mapMessageToProfile({ ...removedMessage, id: messageId });
  }

  async removeChat(senderId: number, recipientId: number) {
    const sender = new User();
    sender.id = senderId;

    const recipient = new User();
    recipient.id = recipientId;

    const chat = await this.findChat(sender, recipient);
    const chatId = chat?.id;

    if (!chat) {
      throw new BadRequestException('Chat does not exist');
    }

    await this.chatRepository.remove(chat);
    return { chatId };
  }

  async findChatsByUser(userId: number, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;

    if (page <= 0 || pageSize <= 0) {
      throw new BadRequestException('Invalid page or pageSize value');
    }

    const chats = await this.chatRepository
      .createQueryBuilder('chat')
      .innerJoinAndSelect('chat.members', 'user')
      .leftJoinAndSelect('chat.members', 'allMembers')
      .orderBy('chat.updatedDate', 'DESC')
      .where('user.id = :userId', { userId })
      .andWhere('allMembers.id != :userId', { userId })
      .skip(skip)
      .take(pageSize)
      .getMany();

    return mapChatsToProfile(chats);
  }

  async getMessages(userId: number, chatId: number, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;

    if (page <= 0 || pageSize <= 0) {
      throw new BadRequestException('Invalid page or pageSize value');
    }

    const user = await this.userService.getUserChats(userId);

    const isMember = user.chats.some((chat) => chat.id === chatId);

    if (!isMember) {
      throw new ForbiddenException();
    }

    const messages = await this.messageRepository.find({
      relations: { sender: true, chat: true },
      where: { chat: { id: chatId } },
      order: { createdDate: 'DESC' },
      take: pageSize,
      skip,
    });

    return mapMessagesToProfile(messages);
  }
}
