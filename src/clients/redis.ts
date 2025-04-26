import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://redis-stack:6379');
export default redis;
