import { User } from 'src/user/entities/user.entity';
import { Chat } from '../entities/chat.entity';
import { Message } from '../entities/message.entity';
import { UserToProfile } from 'src/user/types';

export type CreatedMessage = {
  message: string;
  isLike: boolean;
  chat: Chat;
  sender: User;
} & Message;

export type MessageToProfile = {
  id: number;
  message: string;
  isLike: boolean;
  senderId: number;
  chatId: number;
  createdDate: Date;
  updatedDate: Date;
};

export type ChatsToProfile = {
  id: number;
  member: UserToProfile;
};

export type ChatToProfile = {
  id: number;
  members: { id: number }[];
  createdDate: Date;
  updatedDate: Date;
};
