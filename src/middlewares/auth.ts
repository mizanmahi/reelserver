import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../utils/catchAsync';
import ApiError from '../errors/ApiError';
import env from '../config/config';
import { prisma } from '../database/database';

export const auth = catchAsync(
   async (req: Request, _res: Response, next: NextFunction) => {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token)
         return next(
            new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized!')
         );

      let decodedData: JwtPayload;
      try {
         decodedData = jwt.verify(
            token,
            env.jwt.secret as string
         ) as JwtPayload;
      } catch {
         return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid  token!'));
      }

      const user = await prisma.user.findUnique({
         where: { id: decodedData.id },
         select: { id: true },
      });

      if (!user)
         return next(new ApiError(StatusCodes.NOT_FOUND, 'User not found'));

      req.user = decodedData;
      next();
   }
);
