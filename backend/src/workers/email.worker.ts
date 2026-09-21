import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  DelayedError,
  Worker,
  type Job,
} from "bullmq";

import {
  connectDatabase,
  disconnectDatabase,
} from "../config/database.js";

import {
  connectRedis,
  disconnectRedis,
  redis,
} from "../config/redis.js";

import {
  EMAIL_JOB_NAME,
  EMAIL_QUEUE_NAME,
} from "../queues/queue.constants.js";

import {
  emailRepository,
} from "../repositories/email.repository.js";

import {
  emailService,
} from "../services/email/email.service.js";

import {
  rateLimitService,
} from "../services/rate-limit/rate-limit.service.js";

import {
  maybeCompleteCampaign,
} from "../services/email/campaign-status.service.js";

import {
  updateEmailIndex,
} from "../services/search/email-index.service.js";

import type {
  EmailJobData,
} from "../types/email.types.js";

import { logger } from "../utils/logger.js";
import { env } from "../config/env.js";

import {
  emailWorkerConfig,
} from "./worker.config.js";

async function syncEmailIndex(
  emailId: string,
): Promise<void> {
  if (!env.ELASTICSEARCH_ENABLED) {
    return;
  }

  try {
    const email =
      await emailRepository.findById(
        emailId,
      );

    if (!email) {
      logger.warn(
        { emailId },
        "Email not found during Elasticsearch synchronization",
      );

      return;
    }

    await updateEmailIndex(email);
  } catch (error) {
    logger.error(
      {
        emailId,
        error,
      },
      "Failed to synchronize email with Elasticsearch",
    );
  }
}

async function updateCampaignCompletion(
  campaignId: string,
): Promise<void> {
  try {
    const completed =
      await maybeCompleteCampaign(
        campaignId,
      );

    if (completed) {
      logger.info(
        { campaignId },
        "Campaign marked as completed",
      );
    }
  } catch (error) {
    logger.error(
      {
        campaignId,
        error,
      },
      "Failed to update campaign completion state",
    );
  }
}

async function processEmailJob(
  job: Job<EmailJobData>,
  token?: string,
): Promise<void> {
  const { emailId } = job.data;

  const email =
    await emailRepository.findById(
      emailId,
    );

  if (!email) {
    throw new Error(
      `Email record not found for job: ${job.id}`,
    );
  }

  if (email.status === "SENT") {
    logger.warn(
      {
        emailId,
        jobId: job.id,
      },
      "Skipping already-sent email",
    );

    return;
  }

  const claimed =
    await emailRepository.tryMarkProcessing(
      emailId,
    );

  if (!claimed) {
    logger.warn(
      {
        emailId,
        jobId: job.id,
        status: email.status,
      },
      "Skipping email because another worker owns processing",
    );

    return;
  }

  await syncEmailIndex(emailId);

  const rateLimitDecision =
    await rateLimitService.checkAndReserve(
      email.senderId,
      job.data.hourlyLimit,
      job.data.delayBetweenEmailsMs,
    );

  if (!rateLimitDecision.allowed) {
    if (!token) {
      throw new Error(
        `Worker token unavailable for rate-limit reschedule: ${job.id}`,
      );
    }

    const nextAvailableAt =
      rateLimitDecision.nextAvailableAt;

    await emailRepository.markRateLimited(
      emailId,
      nextAvailableAt,
    );

    await syncEmailIndex(emailId);

    await job.moveToDelayed(
      nextAvailableAt.getTime(),
      token,
    );

    logger.warn(
      {
        emailId,
        jobId: job.id,
        senderId: email.senderId,
        hourlyLimit:
          rateLimitDecision.hourlyLimit,
        currentHourCount:
          rateLimitDecision.currentHourCount,
        nextAvailableAt:
          nextAvailableAt.toISOString(),
      },
      "Email delayed because sender hourly limit was reached",
    );

    throw new DelayedError();
  }

  try {
    const result =
      await emailService.sendEmail(
        emailId,
      );

    await emailRepository.markSent(
      emailId,
    );

    await syncEmailIndex(emailId);

    await updateCampaignCompletion(
      email.campaignId,
    );

    logger.info(
      {
        emailId,
        jobId: job.id,
        senderId: email.senderId,
        messageId: result.messageId,
        previewUrl: result.previewUrl,
      },
      "Email sent successfully",
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown email sending error";

    await emailRepository.markFailed(
      emailId,
      errorMessage,
    );

    await syncEmailIndex(emailId);

    await updateCampaignCompletion(
      email.campaignId,
    );

    logger.error(
      {
        emailId,
        jobId: job.id,
        senderId: email.senderId,
        error: errorMessage,
      },
      "Email sending failed",
    );

    throw error;
  }
}

export function createEmailWorker() {
  const worker =
    new Worker<
      EmailJobData,
      void,
      typeof EMAIL_JOB_NAME
    >(
      EMAIL_QUEUE_NAME,
      processEmailJob,
      {
        connection: redis,
        concurrency:
          emailWorkerConfig.concurrency,
        lockDuration:
          emailWorkerConfig.lockDuration,
        stalledInterval:
          emailWorkerConfig.stalledInterval,
        maxStalledCount:
          emailWorkerConfig.maxStalledCount,
      },
    );

  worker.on("completed", (job) => {
    logger.info(
      { jobId: job.id },
      "BullMQ email job completed",
    );
  });

  worker.on("failed", (job, error) => {
    logger.error(
      {
        jobId: job?.id,
        error: error.message,
      },
      "BullMQ email job failed",
    );
  });

  worker.on("stalled", (jobId) => {
    logger.warn(
      { jobId },
      "BullMQ email job stalled",
    );
  });

  worker.on("error", (error) => {
    logger.error(
      { error: error.message },
      "BullMQ worker error",
    );
  });

  return worker;
}

async function startEmailWorker(): Promise<void> {
  try {
    logger.info(
      "Starting ReachInbox email worker...",
    );

    await connectDatabase();
    await connectRedis();

    const worker =
      createEmailWorker();

    await worker.waitUntilReady();

    logger.info(
      {
        queue: EMAIL_QUEUE_NAME,
        concurrency:
          emailWorkerConfig.concurrency,
      },
      "Email worker is ready",
    );

    const shutdown = async (
      signal: string,
    ): Promise<void> => {
      logger.info(
        { signal },
        "Worker shutdown requested",
      );

      try {
        await worker.close();
        await disconnectRedis();
        await disconnectDatabase();

        logger.info(
          "Email worker shut down",
        );

        process.exit(0);
      } catch (error) {
        logger.error(
          { error },
          "Worker shutdown failed",
        );

        process.exit(1);
      }
    };

    process.on("SIGINT", () => {
      void shutdown("SIGINT");
    });

    process.on("SIGTERM", () => {
      void shutdown("SIGTERM");
    });
  } catch (error) {
    logger.error(
      { error },
      "Failed to start email worker",
    );

    await disconnectRedis().catch(
      () => undefined,
    );

    await disconnectDatabase().catch(
      () => undefined,
    );

    process.exit(1);
  }
}

const currentFile =
  fileURLToPath(import.meta.url);

const executedFile =
  process.argv[1]
    ? path.resolve(process.argv[1])
    : "";

if (currentFile === executedFile) {
  void startEmailWorker();
}