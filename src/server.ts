import { Server } from 'http';
import { PrismaClient } from '@prisma/client';
import app from './app';
import env from './config/config';
import { logger } from './utils/logger';

const prisma = new PrismaClient();
let server: Server | null = null;

async function connectToDatabase() {
   try {
      await prisma.$connect();
      console.log('🛢 Database connected successfully');
   } catch (err) {
      console.error('❌ Failed to connect to the database:', err);
      process.exit(1);
   }
}

function gracefulShutdown(signal: string) {
   console.log(`🔄 Received ${signal}. Shutting down gracefully...`);

   if (server) {
      server.close(async () => {
         logger.info(`🛢   Database is connected successfully`);
         console.log('✅ HTTP server closed.');
         // Disconnect from Prisma
         await prisma.$disconnect();
         console.log('✅ Database connection closed.');
         process.exit(0);
      });
   } else {
      process.exit(0);
   }
}

async function bootstrap() {
   try {
      await connectToDatabase();

      server = app.listen(env.port, () => {
         console.log(
            `🚀 Application is running on http://localhost:${env.port}`
         );
      });

      // Handle termination signals
      process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
      process.on('SIGINT', () => gracefulShutdown('SIGINT'));

      process.on('uncaughtException', (error) => {
         console.error('❌ Uncaught Exception:', error);
         gracefulShutdown('uncaughtException');
      });

      process.on('unhandledRejection', (reason) => {
         console.error('❌ Unhandled Rejection:', reason);
         gracefulShutdown('unhandledRejection');
      });
   } catch (error) {
      console.error('❌ Error during application bootstrap:', error);
      process.exit(1);
   }
}

bootstrap();
