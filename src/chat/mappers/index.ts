import { CreatedMessage, MessageToProfile } from '../types';

export const mapMessageToProfile = (message: CreatedMessage): MessageToProfile => ({
  id: message.id,
  message: message.message,
  isLike: message.isLike,
  senderId: message.sender.id,
  chatId: message.chat.id,
  createdDate: message.createdDate,
  updatedDate: message.updatedDate,
});
