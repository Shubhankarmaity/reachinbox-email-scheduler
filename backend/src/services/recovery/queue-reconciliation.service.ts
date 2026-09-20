import { prisma } from "../../config/database.js";
import { emailQueue } from "../../queues/email.queue.js";
import { emailRepository } from "../../repositories/email.repository.js";
import type { EmailStatus } from "@prisma/client";
import type { EmailJobData } from "../../types/email.types.js";
import { createEmailJobId } from "../../utils/idempotency.js";
import { logger } from "../../utils/logger.js";

const RECOVERABLE_STATUSES: EmailStatus[] = [
  "SCHEDULED",
  "QUEUED",
  "RATE_LIMITED",
];

export interface QueueReconciliationResult {
  scanned: number;
  recovered: number;
  alreadyQueued: number;
  failed: number;
}

export async function reconcileEmailQueue(): Promise<QueueReconciliationResult> {
  const emails = await prisma.email.findMany({
    where: {
      status: {
        in: RECOVERABLE_STATUSES,
      },
    },
    include: {
      campaign: true,
    },
    orderBy: {
      scheduledAt: "asc",
    },
  });

  const result: QueueReconciliationResult = {
    scanned: emails.length,
    recovered: 0,
    alreadyQueued: 0,
    failed: 0,
  };

  for (const email of emails) {
    try {
      const existingJob = await emailQueue.getJob(
        email.jobId,
      );

      if (existingJob) {
        result.alreadyQueued += 1;

        continue;
      }

      const jobData: EmailJobData = {
        emailId: email.id,
        campaignId: email.campaignId,
        userId: email.userId,
        senderId: email.senderId,
        recipient: email.recipient,
        subject: email.subject,
        body: email.body,
        scheduledAt: email.scheduledAt.toISOString(),
        delayBetweenEmailsMs:
          email.campaign.delayBetweenEmailsMs,
        hourlyLimit: email.campaign.hourlyLimit,
      };

      const delay = Math.max(
        0,
        email.scheduledAt.getTime() -
          Date.now(),
      );

      await emailQueue.add(
        "send-email",
        jobData,
        {
          jobId: createEmailJobId(email.id),
          delay,
        },
      );

      if (email.status === "SCHEDULED") {
        await emailRepository.markQueued(
          email.id,
        );
      }

      result.recovered += 1;

      logger.info(
        {
          emailId: email.id,
          jobId: email.jobId,
          scheduledAt:
            email.scheduledAt.toISOString(),
        },
        "Recovered missing email queue job",
      );
    } catch (error) {
      result.failed += 1;

      logger.error(
        {
          emailId: email.id,
          jobId: email.jobId,
          error,
        },
        "Failed to recover email queue job",
      );
    }
  }

  return result;
}

export async function reconcileEmailQueueOnStartup(): Promise<void> {
  const result = await reconcileEmailQueue();

  logger.info(
    result,
    "Email queue reconciliation completed",
  );
}