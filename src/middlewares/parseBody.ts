import { StatusCodes } from 'http-status-codes';
import catchAsync from '../utils/catchAsync';
import { NextFunction, Request, Response } from 'express';
import HttpError from '../errorHandlers/HttpError';

export const parseBody = catchAsync(
   async (req: Request, res: Response, next: NextFunction) => {
      const { data } = req.body;

      if (!data) {
         throw new HttpError(
            StatusCodes.BAD_REQUEST,
            "Please provide data in the body under the 'data' key"
         );
      }

      try {
         const parsedData = JSON.parse(data);
         req.body = { ...req.body, ...parsedData };
      } catch {
         throw new HttpError(
            StatusCodes.BAD_REQUEST,
            "Invalid JSON format in 'data' field"
         );
      }

      next();
   }
);
