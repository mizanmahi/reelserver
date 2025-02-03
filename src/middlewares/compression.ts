import compression from 'compression';
import { Request, Response } from 'express';

// Custom compression middleware
const compress = compression({
   level: 5,
   threshold: 1024, // Compress responses only if size > 1KB
   filter: (req: Request, res: Response) => {
      if (req.headers['x-no-compression']) {
         return false; // Allow client to disable compression
      }
      return compression.filter(req, res);
   },
});

export default compress;
