import { RefreshTokenService } from './refreshToken.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { mapToUserProfile } from 'src/user/mappers';
import { UserDataFromGoogle, UserRequest } from './types';
import { BadRequestException, Injectable } from '@nestjs/common';
import { LoginUserDto } from './dto/login-user.dto';

import * as argon2 from 'argon2';
const crypto = require('crypto');

const USER_AVATAR =
  'https://firebasestorage.googleapis.com/v0/b/wallet-de88d.appspot.com/o/images%2Ficons8-user-48.png?alt=media&token=19934618-f524-42cd-b31d-d07b3de0277d';
``;

function generateUniqueNumber() {
  const current_date = new Date().valueOf().toString();
  const random = Math.random().toString();
  const hash = crypto
    .createHash('sha256')
    .update(current_date + random)
    .digest('hex');
  return parseInt(hash.substring(0, 7), 16);
}
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private refreshTokenService: RefreshTokenService,
  ) {}

  async registration(dto: CreateUserDto) {
    try {
      await this.userService.findUserByEmail(dto.email);

      const hash = await argon2.hash(dto.password);

      const userWithPhotoAndHashPassword = {
        ...dto,
        password: hash,
        photo: USER_AVATAR,
      };

      const newUser = await this.userService.create(userWithPhotoAndHashPassword);

      const tokens = await this.generateTokens(newUser);

      return { ...tokens, user: mapToUserProfile(newUser) };
    } catch (error) {
      switch (true) {
        case error.detail.includes('nickname'): {
          throw new BadRequestException('nickname is already in use');
        }
        case error.detail.includes('email'): {
          throw new BadRequestException('User already exists');
        }
        default: {
          throw new BadRequestException('Something went wrong');
        }
      }
    }
  }

  async login(dto: LoginUserDto) {
    const findUser = await this.userService.findUserByEmail(dto.email);

    if (!findUser) throw new BadRequestException('User does not exist');

    const passwordMatches = await argon2.verify(findUser.password, dto.password);

    if (!passwordMatches) {
      throw new BadRequestException('Password is incorrect');
    }

    const tokens = await this.generateTokens(findUser);

    return { ...tokens, user: mapToUserProfile(findUser) };
  }

  async googleAuth(userDataFromGoogle: UserDataFromGoogle) {
    if (!userDataFromGoogle) {
      throw new BadRequestException('User does not exist');
    }

    const user = await this.userService.findUserByEmail(userDataFromGoogle.email);

    const createGoogleUser: CreateUserDto = {
      email: userDataFromGoogle.email,
      nickname: `${userDataFromGoogle.nickname}${generateUniqueNumber()}`,
      //! add user preview photo
      password: null,
      photo: userDataFromGoogle.photo ?? USER_AVATAR,
    };

    const userData = user ? user : await this.userService.create(createGoogleUser);

    const tokens = await this.generateTokens(userData);

    return { ...tokens, user: mapToUserProfile(userData) };
  }

  logout(userId: number) {
    return this.refreshTokenService.removeToken(userId);
  }

  refreshTokens(user: UserRequest, refreshToken: string) {
    return this.refreshTokenService.refreshTokens(user, refreshToken);
  }

  async refreshTokensLogin(userData: UserRequest, refreshToken: string) {
    try {
      const findUser = await this.userService.findUserById(userData.sub);
      const tokens = await this.refreshTokens(userData, refreshToken);
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
