export type ILoginUser = {
   email: string;
   password: string;
};

export type ILoginUserResponse = {
   token: string;
   refreshToken?: string;
};

export type IRefreshTokenResponse = {
   token: string;
};
