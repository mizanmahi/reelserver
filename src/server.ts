import { Server } from 'http';
import { PrismaClient } from '@prisma/client';
import app from './app';
import config from './config/config';
import logger from './logger/logger';
import { establishDatabaseConnection } from './database/database';

const prisma = new PrismaClient();
let server: Server;

async function startServer() {
   return new Promise<Server>((resolve, reject) => {
      server = app.listen(config.port, () => {
         logger.info(
            `🚀 Application is running on http://localhost:${config.port}`
         );
         resolve(server);
      });

      server.on('error', (err) => {
         logger.error('❌ Error starting server:', err);
         reject(err);
      });
   });
}

async function gracefulShutdown(signal: string) {
   logger.info(`Received ${signal}. Gracefully shutting down...`);

   // Close the server and database connections
   try {
      if (server) {
         await new Promise<void>((resolve, reject) => {
            server.close((err) => {
               if (err) {
                  reject(err);
               } else {
                  resolve();
               }
            });
         });
         logger.info('✅ Server stopped gracefully');
      }

      if (prisma) {
         await prisma.$disconnect();
         logger.info('✅ Database disconnected gracefully');
      }

      process.exit(0);
   } catch (err) {
      logger.error('❌ Error during graceful shutdown:', err);
      process.exit(1);
   }
}

// Catching shutdown signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

async function main() {
   try {
      await establishDatabaseConnection();
      await startServer();
   } catch (error) {
      logger.error('❌ Error during application bootstrap:', error);
      process.exit(1);
   }
}

main();
