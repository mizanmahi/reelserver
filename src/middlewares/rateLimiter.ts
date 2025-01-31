import { rateLimit } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import redis from '../utils/redisClient';

// this is a rate limiter middleware that limits the number of requests from a single IP address
// Fixed Window Counter Rate Limiter
export const limiter = rateLimit({
   // Rate limiter configuration
   windowMs: 10 * 60 * 1000, // 15 minutes
   max: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
   standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
   legacyHeaders: false, // Disable the `X-RateLimit-*` headers

   // Redis store configuration
   store: new RedisStore({
      // @ts-expect-error - Known issue: the `call` function is not present in @types/ioredis
      sendCommand: (...args: string[]) => redis.call(...args),
   }),

   message: {
      success: false,
      message: 'Too many requests. Please try again after a while.',
      //   statusCode: 429,
   },
});
