import { mapToUserProfile, mapToUsersProfile } from 'src/user/mappers';
import { Chat } from '../entities/chat.entity';
import { ChatToProfile, ChatsToProfile, CreatedMessage, MessageToProfile } from '../types';
import { Message } from '../entities/message.entity';

export const mapMessageToProfile = (message: CreatedMessage): MessageToProfile => ({
  id: message.id,
  message: message.message,
  isLike: message.isLike,
  senderId: message.sender.id,
  chatId: message.chat.id,
  createdDate: message.createdDate,
  updatedDate: message.updatedDate,
});

export const mapChatsToProfile = (chats: Chat[], userId: number): ChatsToProfile[] => {
  return chats.map((chat) => ({
    id: chat.id,
    member: mapToUserProfile(chat.members.find((user) => user.id !== userId)),
    messages: chat.messages.map((item) => ({
      ...item,
      senderId: userId,
      chatId: chat.id,
    })),
    lastReadMessageDate: chat.lastReadMessageDate,
    createdDate: chat.createdDate,
    updatedDate: chat.updatedDate,
  }));
};

export const mapChatToProfile = (chat: Chat, senderId: number): ChatToProfile => ({
  id: chat.id,
  member: chat.members?.length && mapToUserProfile(chat.members.find((user) => user.id !== senderId)),
  lastReadMessageDate: chat.lastReadMessageDate,
  createdDate: chat.createdDate,
  updatedDate: chat.updatedDate,
});

export const mapMessagesToProfile = (messages: Message[]): MessageToProfile[] => {
  return messages.map((message) => ({
    id: message.id,
    message: message.message,
    isLike: message.isLike,
    senderId: message.sender.id,
    chatId: message.chat.id,
    createdDate: message.createdDate,
    updatedDate: message.updatedDate,
  }));
};
