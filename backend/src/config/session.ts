import { RedisStore } from "connect-redis";
import session from "express-session";
import { createClient } from "redis";

import { env } from "./env.js";

export const sessionRedisClient = createClient({
  url: env.REDIS_URL,
});

sessionRedisClient.on("error", (error) => {
  console.error("Session Redis error:", error);
});

export const sessionStore = new RedisStore({
  client: sessionRedisClient,
  prefix: "reachinbox:sess:",
  ttl: 7 * 24 * 60 * 60,
});

export const sessionMiddleware = session({
  store: sessionStore,
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,

  cookie: {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite:
      env.NODE_ENV === "production"
        ? "none"
        : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
});

export async function connectSessionRedis(): Promise<void> {
  if (sessionRedisClient.isOpen) {
    return;
  }

  await sessionRedisClient.connect();
}

export async function disconnectSessionRedis(): Promise<void> {
  if (!sessionRedisClient.isOpen) {
    return;
  }

  await sessionRedisClient.quit();
}