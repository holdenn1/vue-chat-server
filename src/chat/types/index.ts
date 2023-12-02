import { User } from 'src/user/entities/user.entity';
import { Chat } from '../entities/chat.entity';
import { Message } from '../entities/message.entity';

export type CreatedMessage = {
  message: string;
  isLike:boolean
  chat: Chat;
  sender: User;
} & Message;

export type MessageToProfile = {
  id: number;
  message: string;
  isLike:boolean;
  senderId: number;
  chatId: number;
  createdDate: Date;
  updatedDate: Date;
};
