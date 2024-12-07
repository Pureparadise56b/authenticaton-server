const { Redis } = require("ioredis");
const {
  REDIS_HOST,
  REDIS_PORT,
  REDIS_USERNAME,
  REDIS_PASSWORD,
} = require("../variables");

const redisClient = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  username: REDIS_USERNAME,
  password: REDIS_PASSWORD,
  connectTimeout: 5000,
});

redisClient.on("error", (error) => {
  console.log("❌ Redis Error: ", error.message);
  process.exit(1);
});

redisClient.on("connect", () => {
  console.log("Redis connection established ✅");
});

module.exports = redisClient;
