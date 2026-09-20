import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { prisma } from "../config/database.js";
import { redis } from "../config/redis.js";
import { elasticsearch } from "../config/elasticsearch.js";

export function getHealth(
  _req: Request,
  res: Response,
): void {
  res.status(200).json({
    success: true,
    status: "ok",
    service: "reachinbox-backend",
    timestamp: new Date().toISOString(),
  });
}

export async function getReadiness(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await Promise.all([
      prisma.$queryRaw`SELECT 1`,
      redis.ping(),
      elasticsearch.ping(),
    ]);

    res.status(200).json({
      success: true,
      status: "ready",
      service: "reachinbox-backend",
      dependencies: {
        postgres: "ok",
        redis: "ok",
        elasticsearch: "ok",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: "not_ready",
      service: "reachinbox-backend",
      dependencies: {
        postgres: "unknown",
        redis: "unknown",
        elasticsearch: "unknown",
      },
      timestamp: new Date().toISOString(),
    });

    next(error);
  }
}