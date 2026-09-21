import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/database.js";
import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";
import type {
  EmailSearchFilters,
  EmailSearchResult,
} from "../../types/email.types.js";
import {
  ensureEmailIndex,
  searchIndexedEmails,
} from "../../integrations/elasticsearch/elasticsearch.client.js";

export async function searchEmails(
  filters: EmailSearchFilters,
): Promise<EmailSearchResult[]> {
  if (env.ELASTICSEARCH_ENABLED) {
    try {
      await ensureEmailIndex();
      return await searchIndexedEmails(filters);
    } catch (error) {
      logger.warn(
        { error },
        "Elasticsearch search failed or unreachable, falling back to PostgreSQL search",
      );
    }
  }

  return searchDatabaseEmails(filters);
}

async function searchDatabaseEmails(
  filters: EmailSearchFilters,
): Promise<EmailSearchResult[]> {
  const where: Prisma.EmailWhereInput = {
    userId: filters.userId,
  };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.senderId) {
    where.senderId = filters.senderId;
  }

  if (filters.campaignId) {
    where.campaignId = filters.campaignId;
  }

  if (filters.from || filters.to) {
    where.scheduledAt = {};
    if (filters.from) {
      where.scheduledAt.gte = filters.from;
    }
    if (filters.to) {
      where.scheduledAt.lte = filters.to;
    }
  }

  if (filters.query) {
    where.OR = [
      { recipient: { contains: filters.query, mode: "insensitive" } },
      { subject: { contains: filters.query, mode: "insensitive" } },
      { body: { contains: filters.query, mode: "insensitive" } },
    ];
  }

  const emails = await prisma.email.findMany({
    where,
    orderBy: {
      scheduledAt: "desc",
    },
    take: 100,
  });

  return emails.map((email) => ({
    id: email.id,
    recipient: email.recipient,
    subject: email.subject,
    senderId: email.senderId,
    campaignId: email.campaignId,
    status: email.status,
    scheduledAt: email.scheduledAt,
    sentAt: email.sentAt,
    failedAt: email.failedAt,
  }));
}