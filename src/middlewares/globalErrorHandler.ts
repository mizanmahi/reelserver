/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Prisma } from '@prisma/client';
import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

const globalErrorHandler: ErrorRequestHandler = (
   error,
   req: Request,
   res: Response,
   next: NextFunction
) => {
   // console.log('🚀 exceptionHandler ~ error:', error);

   let errorMessages: {
      path: string | number;
      message: string;
   }[] = [];

   let statusCode = 500;
   let message = 'Something went wrong';

   res.status(statusCode).json({
      success: false,
      message,
      errorMessages,
   });
};

export default globalErrorHandler;
