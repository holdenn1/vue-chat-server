import { RefreshTokenService } from './refreshToken.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { mapToUserProfile } from 'src/user/mappers';
import { UserDataFromGoogle, UserRequest } from './types';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private refreshTokenService: RefreshTokenService,
    private configService: ConfigService,
  ) {}

  async googleAuth(userDataFromGoogle: UserDataFromGoogle, res) {
    if (!userDataFromGoogle) {
      throw new BadRequestException('No user from google');
    }

    const user = await this.userService.findUserByEmail(userDataFromGoogle.email);

    const createGoogleUser: CreateUserDto = {
      email: userDataFromGoogle.email,
      nickname: userDataFromGoogle.nickname,
      photo: userDataFromGoogle.photo ?? null,  
    };

    const userData = user ? user : await this.userService.create(createGoogleUser);

    const tokens = await this.generateTokens(userData);

    res.cookie('userData', { ...tokens, user: mapToUserProfile(userData) }, { maxAge: 3600000 });
    res.redirect(`${this.configService.get('CLIENT_URL')}#/`);
  }

  logout(userId: number) {
    return this.refreshTokenService.removeToken(userId);
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
