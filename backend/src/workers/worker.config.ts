import { env } from "../config/env.js";

export interface EmailWorkerConfig {
  concurrency: number;

  // How long BullMQ allows a worker to hold a job lock
  // before considering the worker stalled.
  lockDuration: number;

  // How frequently BullMQ checks for stalled jobs.
  stalledInterval: number;

  // Number of stalled jobs that can be checked per interval.
  maxStalledCount: number;
}

export const emailWorkerConfig: EmailWorkerConfig = {
  concurrency: env.WORKER_CONCURRENCY,

  lockDuration: 30_000,

  stalledInterval: 30_000,

  maxStalledCount: 1,
};