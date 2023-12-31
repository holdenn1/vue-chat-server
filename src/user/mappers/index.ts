import { User } from '../entities/user.entity';
import { UserToProfile } from '../types';

export const mapToUserProfile = (user: User): UserToProfile => ({
  id: user.id,
  nickname: user.nickname,
  email: user.email,
  photo: user.photo,
});

export const mapToUsersProfile = (users: User[]): UserToProfile[] => {
  return users.map((user) => ({
    id: user.id,
    nickname: user.nickname,
    email: user.email,
    photo: user.photo,
  }));
};
