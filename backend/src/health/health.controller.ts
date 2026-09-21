import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { prisma } from "../config/database.js";
import { redis } from "../config/redis.js";
import { elasticsearch } from "../config/elasticsearch.js";
import { env } from "../config/env.js";

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
    const checks: Promise<unknown>[] = [
      prisma.$queryRaw`SELECT 1`,
      redis.ping(),
    ];

    if (env.ELASTICSEARCH_ENABLED) {
      checks.push(elasticsearch.ping());
    }

    await Promise.all(checks);

    res.status(200).json({
      success: true,
      status: "ready",
      service: "reachinbox-backend",
      dependencies: {
        postgres: "ok",
        redis: "ok",
        elasticsearch: env.ELASTICSEARCH_ENABLED ? "ok" : "disabled",
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
        elasticsearch: env.ELASTICSEARCH_ENABLED ? "unknown" : "disabled",
      },
      timestamp: new Date().toISOString(),
    });

    next(error);
  }
}