export type JwtPayload = {
  sub: number;
  email: string;
};

export type UserRequest = JwtPayload & {
  refreshToken?: string;
  [key: string]: any;
};

export type UserDataFromGoogle = {
  email: string;
  nickname: string;
  photo: string | undefined;
  [key: string]: any;
};
