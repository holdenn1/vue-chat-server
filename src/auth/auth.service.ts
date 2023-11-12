import { Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Injectable()
export class AuthService {
  create(createAuthDto: CreateUserDto) {
    return 'This action adds a new auth';
  }
}
