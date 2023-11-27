import { User } from "../entities/user.entity";

export type UserToProfile = Omit<
  User,
  'refreshTokens' | 'password' | 'chats' | 'messages'
> ;