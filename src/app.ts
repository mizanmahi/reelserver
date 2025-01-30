import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import { authRoutes } from './modules/auth/auth.routes';
import globalErrorHandler from './middlewares/globalErrorHandler';

const app: Application = express();

// Middlewares
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/auth', authRoutes);

app.get('/', async (req: Request, res: Response) => {
   res.status(200).json({
      success: true,
      message: 'Server is working...!',
   });
});

app.use(globalErrorHandler);

app.use((req: Request, res: Response) => {
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
