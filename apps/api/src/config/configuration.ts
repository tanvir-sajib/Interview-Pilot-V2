import { registerAs } from "@nestjs/config";

export default registerAs("app", () => ({
  port: parseInt(process.env.PORT || "3000", 10),
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
}));
