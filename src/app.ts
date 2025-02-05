import cors, { CorsOptions } from 'cors';
import express, { Application, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import globalErrorHandler from './middlewares/globalErrorHandler';
import logRequest from './middlewares/logger';
import { limiter } from './middlewares/rateLimiter';
import { register } from './clients/prom';
import { trackHttpMetrics } from './middlewares/metrics';
import router from './routes';
import compress from './middlewares/compression';

const app: Application = express();

const allowedOrigins = [
   'http://localhost:3000', // Localhost (adjust the port if needed)
   'https://reelshareclient.netlify.app', // Netlify deployment URL
];

// Define CORS options
const corsOptions: CorsOptions = {
   origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
         callback(null, true); // Allow requests with no origin or from allowed origins
      } else {
         callback(new Error('Not allowed by CORS'));
      }
   },
   credentials: true, // Include credentials (e.g., cookies, authorization headers)
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// app.use(logRequest);
// use log only for the routes starts with /api/v1
app.use('/api/v1', logRequest);
// user rate limiter to all the routes starting with /api/v1
app.use('/api/v1', limiter);
app.use(trackHttpMetrics);
app.use(compress);

app.use('/api/v1', router);

// routes for metrics
app.get('/metrics', async (_req, res) => {
   res.set('Content-Type', register.contentType);
   res.end(await register.metrics());
});

// root route
app.get('/', async (req: Request, res: Response) => {
   res.status(200).json({
      success: true,
      message: 'Server is up and running...!',
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
