import { Prisma } from "@prisma/client";

import { prisma } from "../config/database.js";

export interface CreateCampaignInput {
  userId: string;
  name?: string | null;
  subject: string;
  body: string;
  startTime: Date;
  delayBetweenEmailsMs: number;
  hourlyLimit: number;
  idempotencyKey?: string | null;
}

export class CampaignRepository {
  async findById(id: string) {
    return prisma.campaign.findUnique({
      where: {
        id,
      },
    });
  }

  async findByIdForUser(
    id: string,
    userId: string,
  ) {
    return prisma.campaign.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  async findByIdempotencyKey(
    idempotencyKey: string,
  ) {
    return prisma.campaign.findUnique({
      where: {
        idempotencyKey,
      },
      include: {
        emails: {
          orderBy: {
            scheduledAt: "asc",
          },
        },
      },
    });
  }

  async findManyByUser(
    userId: string,
  ) {
    return prisma.campaign.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async create(
    input: CreateCampaignInput,
    tx: Prisma.TransactionClient = prisma,
  ) {
    return tx.campaign.create({
      data: {
        userId: input.userId,
        name: input.name ?? null,
        subject: input.subject,
        body: input.body,
        startTime: input.startTime,
        delayBetweenEmailsMs:
          input.delayBetweenEmailsMs,
        hourlyLimit: input.hourlyLimit,
        idempotencyKey:
          input.idempotencyKey ?? null,
      },
    });
  }

  async countOutstandingEmails(
    campaignId: string,
  ): Promise<number> {
    return prisma.email.count({
      where: {
        campaignId,
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

  async markCompleted(
    campaignId: string,
  ) {
    return prisma.campaign.updateMany({
      where: {
        id: campaignId,
        status: "ACTIVE",
      },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });
  }

  async cancel(
    campaignId: string,
  ) {
    return prisma.campaign.updateMany({
      where: {
        id: campaignId,
        status: "ACTIVE",
      },
      data: {
        status: "CANCELLED",
      },
    });
  }
}

export const campaignRepository =
  new CampaignRepository();