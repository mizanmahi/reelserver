/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Prisma } from '@prisma/client';
import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import HttpError from '../errorHandlers/HttpError';
import handleZodError from '../errorHandlers/handleZodError';
import handlePrismaClientKnownRequestError from '../errorHandlers/handlePrismaClientKnownRequestError';
import handlePrismaValidationError from '../errorHandlers/handlePrismaValidationError';

const globalExceptionHandler: ErrorRequestHandler = (
   error,
   _req: Request,
   res: Response,
   _next: NextFunction
) => {
   let errorMessages: {
      path: string | number;
      message: string;
   }[] = [];

   let statusCode = 500;
   let message = 'Something went wrong';

   if (error instanceof Prisma.PrismaClientValidationError) {
      const simplifiedError = handlePrismaValidationError(error);
      statusCode = simplifiedError.statusCode;
      message = simplifiedError.message;
      errorMessages = simplifiedError.errorMessages;
   } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
      const simplifiedError = handlePrismaClientKnownRequestError(error);
      statusCode = simplifiedError.statusCode;
      message = simplifiedError.message;
      errorMessages = simplifiedError.errorMessages;
   } else if (error instanceof ZodError) {
      const simplifiedError = handleZodError(error);
      statusCode = simplifiedError.statusCode;
      message = simplifiedError.message;
      errorMessages = simplifiedError.errorMessages;
   } else if (error instanceof HttpError) {
      statusCode = error?.statusCode;
      message = error?.message;
      errorMessages = error?.message
         ? [
              {
                 path: '',
                 message: error?.message,
              },
           ]
         : [];
   } else if (error instanceof Error) {
      message = error?.message;
      errorMessages = error?.message
         ? [
              {
                 path: '',
                 message: error?.message,
              },
           ]
         : [];
   }

   res.status(statusCode).json({
      success: false,
      message,
      errorMessages,
   });
};

export default globalExceptionHandler;
