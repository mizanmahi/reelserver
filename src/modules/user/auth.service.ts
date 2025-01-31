import { User } from '@prisma/client';
import HttpError from '../../errorHandlers/HttpError';
import { comparePasswords, hashedPassword } from './auth.utils';
import { StatusCodes } from 'http-status-codes';
import { jwtHelpers } from '../../utils/jwtHelper';
import {
   ILoginUser,
   ILoginUserResponse,
   IRefreshTokenResponse,
} from './auth.interface';
import config from '../../config/config';
import { JwtPayload, Secret } from 'jsonwebtoken';
import { prisma } from '../../database/database';

const registerUser = async (payload: User): Promise<Partial<User>> => {
   const existingUser = await prisma.user.findUnique({
      where: {
         email: payload.email,
      },
   });

   if (existingUser)
      throw new HttpError(StatusCodes.BAD_REQUEST, 'Email already in use!');

   payload.password = await hashedPassword(payload.password);

   const user = await prisma.user.create({
      data: payload,
      select: {
         id: true,
         name: true,
         email: true,
         contact: true,
         createdAt: true,
         updatedAt: true,
      },
   });

   return user;
};

const loginUser = async (payload: ILoginUser): Promise<ILoginUserResponse> => {
   const { email, password } = payload;
   const user = await prisma.user.findUnique({
      where: {
         email,
      },
   });

   if (!user)
      throw new HttpError(StatusCodes.BAD_REQUEST, 'Invalid credentials!');

   const isPasswordValid = await comparePasswords(password, user.password);
   if (!isPasswordValid)
      throw new HttpError(StatusCodes.BAD_REQUEST, 'Wrong password!');

   const accessToken = jwtHelpers.createToken(
      { id: user.id, email: user.email },
      config.jwt.secret as Secret,
      config.jwt.expires_in as string
   );

   const refreshToken = jwtHelpers.createToken(
      { id: user.id, email: user.email },
      config.jwt.refresh_secret as Secret,
      config.jwt.refresh_expires_in as string
   );

   return {
      token: accessToken,
      refreshToken,
   };
};

const refreshToken = async (token: string): Promise<IRefreshTokenResponse> => {
   let verifiedToken = null;
   try {
      verifiedToken = jwtHelpers.verifyToken(
         token,
         config.jwt.refresh_secret as Secret
      );
      //   eslint-disable-next-line @typescript-eslint/no-unused-vars
   } catch (err) {
      throw new HttpError(StatusCodes.FORBIDDEN, 'Invalid refresh token');
   }

   const { id } = verifiedToken;

   const isUserExist = await prisma.user.findUnique({
      where: {
         id,
      },
      select: {
         id: true,
         email: true,
      },
   });
   if (!isUserExist) {
      throw new HttpError(StatusCodes.NOT_FOUND, 'User not found');
   }

   const newToken = jwtHelpers.createToken(
      { id: isUserExist.id, email: isUserExist.email },
      config.jwt.secret as Secret,
      config.jwt.expires_in as string
   );

   return {
      token: newToken,
   };
};

const changePassword = async (
   user: JwtPayload,
   payload: { oldPassword: string; newPassword: string }
) => {
   const userData = await prisma.user.findUniqueOrThrow({
      where: {
         email: user.email,
      },
   });

   const isCorrectPassword: boolean = await comparePasswords(
      payload.oldPassword,
      userData.password
   );

   if (!isCorrectPassword) {
      throw new Error('Password is incorrect!');
   }

   const newHashedPassword = await hashedPassword(payload.newPassword);

   await prisma.user.update({
      where: {
         email: userData.email,
      },
      data: {
         password: newHashedPassword,
      },
   });

   return {
      message: 'Password changed successfully!',
   };
};

export const AuthServices = {
   registerUser,
   loginUser,
   refreshToken,
   changePassword,
};
