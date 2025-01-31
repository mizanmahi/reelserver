import { NextFunction, Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import { AuthServices } from './auth.service';
import catchAsync from '../../utils/catchAsync';
import env from '../../config/config';
import { ILoginUserResponse, IRefreshTokenResponse } from './auth.interface';
import { StatusCodes } from 'http-status-codes';

const registerUser = async (
   req: Request,
   res: Response,
   next: NextFunction
) => {
   try {
      const result = await AuthServices.registerUser(req.body);
      sendResponse(res, {
         statusCode: StatusCodes.CREATED,
         success: true,
         message: 'User registered successfully!',
         data: result,
      });
   } catch (error) {
      next(error);
   }
};

const loginUser = catchAsync(async (req: Request, res: Response) => {
   const result = await AuthServices.loginUser(req.body);
   const { refreshToken } = result;
   const cookieOptions = {
      secure: env.env === 'production',
      httpOnly: true,
   };

   res.cookie('refreshToken', refreshToken, cookieOptions);

   sendResponse<ILoginUserResponse>(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Logged in successfully!',
      data: {
         token: result.token,
      },
   });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
   const { refreshToken } = req.cookies;

   const result = await AuthServices.refreshToken(refreshToken);

   sendResponse<IRefreshTokenResponse>(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Access token generated!',
      data: result,
   });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
   const user = req.user;
   const payload = req.body;

   const result = await AuthServices.changePassword(user, payload);

   sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Password changed successfully!',
      data: result,
   });
});

export const AuthController = {
   registerUser,
   loginUser,
   refreshToken,
   changePassword,
};
