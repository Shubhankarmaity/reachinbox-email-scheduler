import { randomUUID } from "node:crypto";

import { Prisma } from "@prisma/client";

import { prisma } from "../../config/database.js";
import { emailQueue } from "../../queues/email.queue.js";
import { emailRepository } from "../../repositories/email.repository.js";
import {
  campaignRepository,
} from "../../repositories/campaign.repository.js";
import {
  senderRepository,
} from "../../repositories/sender.repository.js";
import {
  indexEmailRecords,
} from "../search/email-index.service.js";
import {
  createEmailJobId,
  createScopedIdempotencyKey,
} from "../../utils/idempotency.js";
import {
  EMAIL_JOB_NAME,
} from "../../queues/queue.constants.js";
import {
  logger,
} from "../../utils/logger.js";
import type {
  EmailJobData,
  ScheduleEmailInput,
} from "../../types/email.types.js";

export interface ScheduleEmailResult {
  campaignId: string;
  emailCount: number;
  emails: Array<{
    id: string;
    recipient: string;
    scheduledAt: Date;
    jobId: string;
  }>;
  idempotentReplay: boolean;
}

function buildResult(
  campaignId: string,
  emails: Array<{
    id: string;
    recipient: string;
    scheduledAt: Date;
    jobId: string;
  }>,
  idempotentReplay: boolean,
): ScheduleEmailResult {
  return {
    campaignId,
    emailCount: emails.length,
    emails,
    idempotentReplay,
  };
}

async function enqueueCampaignJobs(
  emails: Array<{
    id: string;
    userId: string;
    campaignId: string;
    senderId: string;
    recipient: string;
    subject: string;
    body: string;
    scheduledAt: Date;
  }>,
  delayBetweenEmailsMs: number,
  hourlyLimit: number,
): Promise<void> {
  const now = Date.now();

  const jobs: EmailJobData[] =
    emails.map((email) => ({
      emailId: email.id,
      campaignId: email.campaignId,
      userId: email.userId,
      senderId: email.senderId,
      recipient: email.recipient,
      subject: email.subject,
      body: email.body,
      scheduledAt:
        email.scheduledAt.toISOString(),
      delayBetweenEmailsMs,
      hourlyLimit,
    }));

  if (jobs.length === 0) {
    return;
  }

  await emailQueue.addBulk(
    jobs.map((job) => ({
      name: EMAIL_JOB_NAME,
      data: job,
      opts: {
        jobId:
          createEmailJobId(job.emailId),
        delay: Math.max(
          0,
          new Date(
            job.scheduledAt,
          ).getTime() - now,
        ),
      },
    })),
  );
}

async function getIdempotentReplay(
  userId: string,
  scopedIdempotencyKey: string,
): Promise<ScheduleEmailResult | null> {
  const existingCampaign =
    await campaignRepository.findByIdempotencyKey(
      scopedIdempotencyKey,
    );

  if (!existingCampaign) {
    return null;
  }

  const emails =
    existingCampaign.emails;

  return buildResult(
    existingCampaign.id,
    emails.map((email) => ({
      id: email.id,
      recipient: email.recipient,
      scheduledAt: email.scheduledAt,
      jobId: email.jobId,
    })),
    true,
  );
}

export class EmailSchedulerService {
  async scheduleEmails(
    input: ScheduleEmailInput,
    clientIdempotencyKey?: string,
  ): Promise<ScheduleEmailResult> {
    const sender =
      await senderRepository.findByIdForUser(
        input.senderId,
        input.userId,
      );

    if (!sender) {
      throw new Error("Sender not found");
    }

    if (!sender.isActive) {
      throw new Error("Sender is inactive");
    }

    const scopedIdempotencyKey =
      clientIdempotencyKey
        ? createScopedIdempotencyKey(
            input.userId,
            clientIdempotencyKey,
          )
        : undefined;

    // -------------------------------------------------------------------------
    // Fast idempotency path
    // -------------------------------------------------------------------------

    if (scopedIdempotencyKey) {
      const replay =
        await getIdempotentReplay(
          input.userId,
          scopedIdempotencyKey,
        );

      if (replay) {
        return replay;
      }
    }

    // -------------------------------------------------------------------------
    // Normalize recipients.
    // -------------------------------------------------------------------------

    const uniqueRecipients =
      Array.from(
        new Set(
          input.recipients.map(
            (recipient) =>
              recipient.trim().toLowerCase(),
          ),
        ),
      );

    if (uniqueRecipients.length === 0) {
      throw new Error(
        "No valid recipients were provided",
      );
    }

    // -------------------------------------------------------------------------
    // Build deterministic email records.
    // -------------------------------------------------------------------------

    const emailInputs =
      uniqueRecipients.map(
        (recipient, index) => {
          const scheduledAt =
            new Date(
              input.startTime.getTime() +
                index *
                  input.delayBetweenEmailsMs,
            );

          const emailId = randomUUID();

          return {
            id: emailId,
            campaignId: "",
            userId: input.userId,
            senderId: input.senderId,
            recipient,
            subject: input.subject,
            body: input.body,
            scheduledAt,
            jobId:
              createEmailJobId(emailId),
          };
        },
      );

    // -------------------------------------------------------------------------
    // Atomically create campaign + emails.
    // -------------------------------------------------------------------------

    let transactionResult;

    try {
      transactionResult =
        await prisma.$transaction(
          async (tx) => {
            const campaign =
              await campaignRepository.create(
                {
                  userId: input.userId,
                  name:
                    input.campaignName ??
                    null,
                  subject:
                    input.subject,
                  body: input.body,
                  startTime:
                    input.startTime,
                  delayBetweenEmailsMs:
                    input.delayBetweenEmailsMs,
                  hourlyLimit:
                    input.hourlyLimit,
                  idempotencyKey:
                    scopedIdempotencyKey ??
                    null,
                },
                tx,
              );

            const emails =
              emailInputs.map(
                (email) => ({
                  ...email,
                  campaignId:
                    campaign.id,
                }),
              );

            await emailRepository.createMany(
              emails,
              tx,
            );

            return {
              campaign,
              emails,
            };
          },
        );
    } catch (error) {
      // Another request may have created the same idempotent campaign
      // between our initial lookup and this transaction.
      if (
        scopedIdempotencyKey &&
        error instanceof
          Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const replay =
          await getIdempotentReplay(
            input.userId,
            scopedIdempotencyKey,
          );

        if (replay) {
          return replay;
        }
      }

      throw error;
    }

    // -------------------------------------------------------------------------
    // Create persistent delayed BullMQ jobs.
    // -------------------------------------------------------------------------

    await enqueueCampaignJobs(
      transactionResult.emails,
      input.delayBetweenEmailsMs,
      input.hourlyLimit,
    );

    // -------------------------------------------------------------------------
    // Bulk index for Elasticsearch.
    // -------------------------------------------------------------------------

    try {
      const persistedEmails =
        await prisma.email.findMany({
          where: {
            campaignId:
              transactionResult
                .campaign.id,
          },
        });

      await indexEmailRecords(
        persistedEmails,
      );
    } catch (error) {
      logger.error(
        {
          campaignId:
            transactionResult.campaign.id,
          error,
        },
        "Failed to bulk-index campaign emails in Elasticsearch",
      );
    }

    return buildResult(
      transactionResult.campaign.id,
      transactionResult.emails.map(
        (email) => ({
          id: email.id,
          recipient: email.recipient,
          scheduledAt:
            email.scheduledAt,
          jobId: email.jobId,
        }),
      ),
      false,
    );
  }
}

export const emailSchedulerService =
  new EmailSchedulerService();