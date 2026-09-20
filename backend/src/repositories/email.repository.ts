import type { Prisma } from "@prisma/client";
import { prisma } from "../config/database.js";

export interface CreateEmailInput {
  id: string;
  campaignId: string;
  userId: string;
  senderId: string;
  recipient: string;
  subject: string;
  body: string;
  scheduledAt: Date;
  jobId: string;
}

export class EmailRepository {
  async findById(id: string) {
    return prisma.email.findUnique({
      where: {
        id,
      },
    });
  }

  async findByJobId(jobId: string) {
    return prisma.email.findUnique({
      where: {
        jobId,
      },
    });
  }

  async findByIdForUser(
    id: string,
    userId: string,
  ) {
    return prisma.email.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  async findManyByUser(userId: string) {
    return prisma.email.findMany({
      where: {
        userId,
      },
      orderBy: {
        scheduledAt: "desc",
      },
    });
  }

  async findScheduledByUser(userId: string) {
    return prisma.email.findMany({
      where: {
        userId,
        status: {
          in: [
            "SCHEDULED",
            "QUEUED",
            "PROCESSING",
            "RATE_LIMITED",
          ],
        },
      },
      orderBy: {
        scheduledAt: "asc",
      },
    });
  }

  async findSentByUser(userId: string) {
    return prisma.email.findMany({
      where: {
        userId,
        status: {
          in: [
            "SENT",
            "FAILED",
          ],
        },
      },
      orderBy: {
        sentAt: "desc",
        createdAt: "desc",
      },
    });
  }

  async findScheduledByUserPaginated(
    userId: string,
    skip: number,
    take: number,
  ) {
    return prisma.email.findMany({
      where: {
        userId,
        status: {
          in: [
            "SCHEDULED",
            "QUEUED",
            "PROCESSING",
            "RATE_LIMITED",
          ],
        },
      },
      orderBy: {
        scheduledAt: "asc",
      },
      skip,
      take,
    });
  }

  async findSentByUserPaginated(
    userId: string,
    skip: number,
    take: number,
  ) {
    return prisma.email.findMany({
      where: {
        userId,
        status: {
          in: [
            "SENT",
            "FAILED",
          ],
        },
      },
      orderBy: [
        {
          sentAt: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
      skip,
      take,
    });
  }

  async countScheduledByUser(
    userId: string,
  ): Promise<number> {
    return prisma.email.count({
      where: {
        userId,
        status: {
          in: [
            "SCHEDULED",
            "QUEUED",
            "PROCESSING",
            "RATE_LIMITED",
          ],
        },
      },
    });
  }

  async countSentByUser(
    userId: string,
  ): Promise<number> {
    return prisma.email.count({
      where: {
        userId,
        status: {
          in: [
            "SENT",
            "FAILED",
          ],
        },
      },
    });
  }

  async create(
    input: CreateEmailInput,
    tx: Prisma.TransactionClient = prisma,
  ) {
    return tx.email.create({
      data: {
        id: input.id,
        campaignId: input.campaignId,
        userId: input.userId,
        senderId: input.senderId,
        recipient: input.recipient,
        subject: input.subject,
        body: input.body,
        scheduledAt: input.scheduledAt,
        jobId: input.jobId,
      },
    });
  }

  async createMany(
    inputs: CreateEmailInput[],
    tx: Prisma.TransactionClient = prisma,
  ) {
    return tx.email.createMany({
      data: inputs,
    });
  }

  async markQueued(id: string) {
    return prisma.email.update({
      where: {
        id,
      },
      data: {
        status: "QUEUED",
      },
    });
  }

  async tryMarkProcessing(
    id: string,
  ): Promise<boolean> {
    const result =
      await prisma.email.updateMany({
        where: {
          id,
          status: {
            in: [
              "SCHEDULED",
              "QUEUED",
              "RATE_LIMITED",
            ],
          },
        },
        data: {
          status: "PROCESSING",
          processingStartedAt: new Date(),
          attemptCount: {
            increment: 1,
          },
          lastError: null,
        },
      });

    return result.count === 1;
  }

  async markProcessing(id: string) {
    return prisma.email.update({
      where: {
        id,
      },
      data: {
        status: "PROCESSING",
        processingStartedAt: new Date(),
        attemptCount: {
          increment: 1,
        },
        lastError: null,
      },
    });
  }

  async markSent(id: string) {
    return prisma.email.update({
      where: {
        id,
      },
      data: {
        status: "SENT",
        sentAt: new Date(),
        processingStartedAt: null,
        lastError: null,
      },
    });
  }

  async markFailed(
    id: string,
    error: string,
  ) {
    return prisma.email.update({
      where: {
        id,
      },
      data: {
        status: "FAILED",
        failedAt: new Date(),
        processingStartedAt: null,
        lastError: error,
      },
    });
  }

  async markRateLimited(
    id: string,
    scheduledAt: Date,
  ) {
    return prisma.email.update({
      where: {
        id,
      },
      data: {
        status: "RATE_LIMITED",
        scheduledAt,
        processingStartedAt: null,
      },
    });
  }
}

export const emailRepository =
  new EmailRepository();