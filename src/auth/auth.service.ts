import { RefreshTokenService } from './refreshToken.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { mapToUserProfile } from 'src/user/mappers';
import { UserRequest } from './types';

import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';


@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private refreshTokenService: RefreshTokenService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async registration(dto: CreateUserDto, userPhoto: Express.Multer.File): Promise<any> {
    const userExists = await this.userService.findUserByEmail(dto.email);

    if (userExists) {
      throw new BadRequestException('User already exists');
    }
    const hash = await argon2.hash(dto.password);

    const avatar = await this.userService.uploadAvatar(userPhoto);

    const userWithPhotoAndHashPassword = {
      ...dto,
      password: hash,
      photo: avatar,
    };
    const newUser = await this.userService.create(userWithPhotoAndHashPassword);

    const tokens = await this.generateTokens(newUser);

    return { ...tokens, user: mapToUserProfile(newUser) };
  }

  refreshTokens(user: UserRequest) {
    return this.refreshTokenService.refreshTokens(user);
  }

  async refreshTokensLogin(userData: UserRequest) {
    try {
      const findUser = await this.userService.findUserById(userData.sub);
      const tokens = await this.refreshTokens(userData);
      const user = mapToUserProfile(findUser);
      return { user, tokens };
    } catch {
      throw new BadRequestException('An error occurred');
    }
  }

  async generateTokens(user: User) {
    const tokens = await this.refreshTokenService.getTokens(user.id, user.email);

    await this.refreshTokenService.create({
      user,
      token: tokens.refreshToken,
    });

    return tokens;
  }
}
