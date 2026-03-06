import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Connected'));

await redisClient.connect();

export const cacheUserNotifications = async (userId, notification) => {
  try {
    const key = `notifications:${userId}`;
    await redisClient.lPush(key, JSON.stringify(notification));
    await redisClient.lTrim(key, 0, 49); // Keep last 50 notifications
  } catch (error) {
    console.error('Redis cache error:', error);
  }
};

export const getUserNotifications = async (userId) => {
  try {
    const key = `notifications:${userId}`;
    const notifications = await redisClient.lRange(key, 0, -1);
    return notifications.map(n => JSON.parse(n));
  } catch (error) {
    console.error('Redis fetch error:', error);
    return [];
  }
};

export default redisClient;