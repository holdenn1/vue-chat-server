import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

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
}
