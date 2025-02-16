import { createClient } from "redis";
import { REDIS_HOST } from '../configs/vars'

const redisClient = createClient({
  url: REDIS_HOST || 'redis://localhost:6379', // Redis server URL
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

// Connect to Redis
// await redisClient.connect();
(async () => {
    await redisClient.connect();
  })();

export default redisClient;
