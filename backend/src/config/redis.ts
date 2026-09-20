import { Redis } from "ioredis";

import { env } from "./env.js";

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  lazyConnect: true,
});

export async function connectRedis(): Promise<void> {
  if (redis.status === "ready") {
    return;
  }

  if (
    redis.status === "connecting" ||
    redis.status === "connect" ||
    redis.status === "reconnecting"
  ) {
    await new Promise<void>((resolve, reject) => {
      const handleReady = () => {
        cleanup();
        resolve();
      };

      const handleError = (error: Error) => {
        cleanup();
        reject(error);
      };

      const cleanup = () => {
        redis.off("ready", handleReady);
        redis.off("error", handleError);
      };

      redis.once("ready", handleReady);
      redis.once("error", handleError);
    });

    return;
  }

  await redis.connect();
}

export async function disconnectRedis(): Promise<void> {
  if (
    redis.status === "end" ||
    redis.status === "close"
  ) {
    return;
  }

  await redis.quit();
}