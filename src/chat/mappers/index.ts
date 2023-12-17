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

export const mapChatsToProfile = (chats: Chat[]): ChatsToProfile[] => {
  return chats.map((chat) => ({
    id: chat.id,
    member: mapToUserProfile(chat.members[0]),
  }));
};

export const mapChatToProfile = (chat: Chat): ChatToProfile => ({
  id: chat.id,
  members: chat.members,
});

export const mapMessagesToProfile = (messages: Message[]):MessageToProfile[] => {
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
