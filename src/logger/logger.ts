import winston from 'winston';
import 'winston-daily-rotate-file';

const dailyRotateFileTransport = new winston.transports.DailyRotateFile({
   filename: 'logs/application-%DATE%.log',
   datePattern: 'YYYY-MM-DD',
   zippedArchive: true, // Optional: To zip old logs
   maxSize: '20m', // Optional: Maximum file size before rotating
   maxFiles: '14d', // Optional: Keep logs for the last 14 days
});

// Set up console transport
const consoleTransport = new winston.transports.Console({
   format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
   ),
});

// Create the logger instance
const logger = winston.createLogger({
   level: 'info', // Set default log level (e.g., 'info', 'debug', 'warn', etc.)
   format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message }) => {
         return `${timestamp} [${level}]: ${message}`;
      })
   ),
   transports: [
      dailyRotateFileTransport, // Write to log file
      consoleTransport, // Write to console
   ],
});

export default logger;
