const redis = require('redis');

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || 6379;

const redisClient = redis.createClient({
  url: `redis://${redisHost}:${redisPort}`
})

const rateLimitWindowMilliseconds = 60000;
const rateLimitMaxRequests = 10;
const rateLimitMaxRequestsAuth = 30


exports.redisClient = redisClient;

exports.rateLimit = async (req, res, next) => {
  try {
    let tokenBucket = await redisClient.hGetAll(req.ip)

    let maxRequests = rateLimitMaxRequests;
    let refreshRate = rateLimitMaxRequests / rateLimitWindowMilliseconds
    console.log(req.user)
    if (req.user) {
      maxRequests = rateLimitMaxRequestsAuth;
      refreshRate = rateLimitMaxRequestsAuth / rateLimitWindowMilliseconds
    }

    tokenBucket = {
      tokens: parseFloat(tokenBucket.tokens) || maxRequests,
      last: parseInt(tokenBucket.last) || Date.now()
    }

    console.log(tokenBucket)


    const timestamp = Date.now()
    const elapsedMilliseconds = timestamp - tokenBucket.last

    tokenBucket.tokens += elapsedMilliseconds * refreshRate
    tokenBucket.tokens = Math.min(maxRequests, tokenBucket.tokens)
    tokenBucket.last = timestamp

    if (tokenBucket.tokens >= 1) {
      tokenBucket.tokens -= 1;
      await redisClient.hSet(req.ip, [
        ['tokens', tokenBucket.tokens],
        ['last', tokenBucket.last]
      ])
      next();
    } else {
      await redisClient.hSet(req.ip, [
        ['tokens', tokenBucket.tokens],
        ['last', tokenBucket.last]
      ])
      res.status(429).json({
        error: "Too many requests per minute"
      });
    }
  }
  catch (err) {
    console.log(err)
    next()
    return;
  }
}

