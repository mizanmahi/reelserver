import { Request, Response, NextFunction } from 'express';
import { httpRequestCounter, httpRequestDuration } from '../clients/prom';

export const trackHttpMetrics = (
   req: Request,
   res: Response,
   next: NextFunction
) => {
   const start = process.hrtime();

   res.on('finish', () => {
      const duration = process.hrtime(start);
      const seconds = duration[0] + duration[1] / 1e9;

      const route = req.route?.path || req.path;
      const statusCode = res.statusCode.toString();

      httpRequestDuration
         .labels(req.method, route, statusCode)
         .observe(seconds);
      httpRequestCounter.labels(req.method, route, statusCode).inc();
   });

   next();
};
