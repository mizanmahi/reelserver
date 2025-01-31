import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import { videoRoutes } from './modules/video/video.routes';
import { authRoutes } from './modules/user/auth.routes';
import globalErrorHandler from './middlewares/globalErrorHandler';
import { analyticsRoutes } from './modules/statistics/statistics.routes';
import logRequest from './middlewares/logger';
import { limiter } from './middlewares/rateLimiter';
import { register } from './clients/prom';
import { trackHttpMetrics } from './middlewares/metrics';

const app: Application = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(logRequest);
// user rate limiter to all the routes starting with /api/v1
app.use('/api/v1', limiter);
app.use(trackHttpMetrics);

app.use('/api/v1/video', videoRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.get('/metrics', async (_req, res) => {
   res.set('Content-Type', register.contentType);
   res.end(await register.metrics());
});

app.get('/', async (req: Request, res: Response) => {
   res.status(200).json({
      success: true,
      message: 'Server is working...!',
   });
});

app.use(globalErrorHandler);

app.use((req: Request, res: Response) => {
   console.log(req.originalUrl);
   res.status(404).json({
      success: false,
      message: 'Not Found',
      errorMessages: [
         {
            path: req.originalUrl,
            message: 'API Not Found',
         },
      ],
   });
});

export default app;
