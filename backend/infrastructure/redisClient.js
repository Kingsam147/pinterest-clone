const Redis = require('ioredis');

const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  retryStrategy: (times) => {
    if (times > 3) return null;
    return Math.min(times * 200, 2000);
  },
  connectTimeout: 5000,
});

redisClient.on('error', (error) => {
  console.error('Redis error:', error.message);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

module.exports = redisClient;
