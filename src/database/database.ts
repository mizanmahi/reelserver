// src/database/database.ts
import { PrismaClient } from '@prisma/client';
import logger from '../logger/logger';

const prisma = new PrismaClient();

export async function establishDatabaseConnection() {
   try {
      await prisma.$connect();
      logger.info('🛢️  Database connection established successfully');
   } catch (error) {
      logger.error(
         `⚠️Database connection failed: ${(error as Error).message}`,
         {
            error,
         }
      );
      process.exit(1);
   }
}

export { prisma };
