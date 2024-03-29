import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ILike, Not, Repository } from 'typeorm';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from 'src/firebase';
import { mapToUserProfile, mapToUsersProfile } from './mappers';
import { UpdateUserDto } from './dto/update-user.dto';
import { Message } from 'src/chat/entities/message.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto) {
    return await this.userRepository.save(dto);
  }

  async findUserByEmail(email: string) {
    if (!email) {
      throw new BadRequestException(`User by ${email} not found`);
    }
    return await this.userRepository.findOne({ where: { email } });
  }

  async findUserByNickname(nickname: string) {
    if (!nickname) {
      throw new BadRequestException(`User by ${nickname} not found`);
    }
    return await this.userRepository.findOne({ where: { nickname } });
  }

  async findUserById(id: number) {
    if (!id) {
      throw new BadRequestException(`User by ${id} not found`);
    }
    return await this.userRepository.findOne({ where: { id } });
  }

  async getUserChats(userId) {
    return await this.userRepository.findOne({ relations: { chats: true }, where: { id: userId } });
  }

  async searchUsersByNickname(nickname: string, userId: number) {
    const users = await this.userRepository.find({
      where: { nickname: ILike(`%${nickname}%`), id: Not(userId) },
      take: 5,
    });
    return mapToUsersProfile(users);
  }

  async uploadAvatar(cover: Express.Multer.File) {
    const metadata = { contentType: 'image/jpeg' };
    const storageRef = ref(storage, 'vue-chat-images/' + cover.originalname);
    const uploadBook = uploadBytesResumable(storageRef, cover.buffer, metadata);

    await new Promise((res, rej) => {
      uploadBook.on('state_changed', null, rej, res as () => void);
    });

    return await getDownloadURL(uploadBook.snapshot.ref);
  }

  async updateUserAvatar(cover: Express.Multer.File, userId: number) {
    if (!userId) {
      throw new BadRequestException('Key not found');
    }

    const avatar = await this.uploadAvatar(cover);

    const user = await this.updateUser(userId, { photo: avatar });

    return user;
  }

  async updateUser(id: number, dto: Partial<UpdateUserDto>) {
    const user = await this.findUserById(id);

    if (!user) {
      throw new BadRequestException('User does not exist');
    }

    user.nickname = dto.nickname ?? user.nickname;
    user.photo = dto.photo ?? user.photo;

    const updatedUser = await this.userRepository.save(user);

    return mapToUserProfile(updatedUser);
  }
}
