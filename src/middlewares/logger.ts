import { Request, Response, NextFunction } from 'express';
import logger from '../logger/logger';

const logRequest = (req: Request, res: Response, next: NextFunction) => {
   logger.info(`${req.method} ${req.url}`);
   next();
};

export default logRequest;
