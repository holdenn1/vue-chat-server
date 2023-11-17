import { RefreshTokenService } from './refreshToken.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { mapToUserProfile } from 'src/user/mappers';
import { UserDataFromGoogle, UserRequest } from './types';
import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private refreshTokenService: RefreshTokenService,
    private configService: ConfigService,
  ) {}

  async registration(dto: CreateUserDto) {
    const userExists = await this.userService.findUserByEmail(dto.email);

    if (userExists) {
      throw new BadRequestException('User already exists');
    }

    const hash = await argon2.hash(dto.password);

    const userWithPhotoAndHashPassword = {
      ...dto,
      password: hash,
      photo: '', //! add user avatar from storage
    };
    const newUser = await this.userService.create(userWithPhotoAndHashPassword);

    const tokens = await this.generateTokens(newUser);

    return { ...tokens, user: mapToUserProfile(newUser) };
  }

  async login(dto: LoginUserDto) {
    const findUser = await this.userService.findUserByEmail(dto.email);

    if (!findUser) throw new BadRequestException('User does not exist');

    if (!findUser.password) {
      throw new ForbiddenException('The password is not correct');
    }

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

    console.log(userDataFromGoogle);

    const user = await this.userService.findUserByEmail(userDataFromGoogle.email);

    const createGoogleUser: CreateUserDto = {
      email: userDataFromGoogle.email,
      nickname: userDataFromGoogle.nickname,
      //! add user preview photo
      password: null,
      photo: userDataFromGoogle.photo ?? '',
    };

    const userData = user ? user : await this.userService.create(createGoogleUser);

    const tokens = await this.generateTokens(userData);

    return { ...tokens, user: mapToUserProfile(userData) };

    //res.cookie('userData', { ...tokens, user: mapToUserProfile(userData) }, { maxAge: 3600000 });

    //res.redirect(`${this.configService.get('CLIENT_URL')}#/`);
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
