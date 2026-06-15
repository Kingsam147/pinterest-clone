const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const redisClient = require('../infrastructure/redisClient');

const buildLimiter = (maxRequests, windowMinutes) => {
  const limiter = rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
    }),
    handler: (req, res) => {
      res.status(429).json({ message: 'Too many requests, please try again later.' });
    },
  });

  return (req, res, next) => {
    limiter(req, res, (err) => {
      if (err) {
        console.error('Rate limiter error:', err.message);
        return next();
      }
      next();
    });
  };
};

const authLimiter = buildLimiter(5, 1);
const adminLimiter = buildLimiter(20, 1);
const writeLimiter = buildLimiter(30, 1);
const readLimiter = buildLimiter(100, 1);

module.exports = { authLimiter, adminLimiter, writeLimiter, readLimiter };
