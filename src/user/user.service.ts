import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from 'src/firebase';

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

  async findUserById(id: number) {
    if (!id) {
      throw new BadRequestException(`User by ${id} not found`);
    }
    return await this.userRepository.findOne({ where: { id } });
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
}
