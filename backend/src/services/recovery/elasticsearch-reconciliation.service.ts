import { prisma } from "../../config/database.js";
import { ensureEmailIndex } from "../../integrations/elasticsearch/elasticsearch.client.js";
import { indexEmailRecords } from "../search/email-index.service.js";
import { logger } from "../../utils/logger.js";

const BATCH_SIZE = 500;

export interface ElasticsearchReconciliationResult {
  scanned: number;
  indexed: number;
  failed: number;
}

export async function reconcileElasticsearchIndex(): Promise<ElasticsearchReconciliationResult> {
  await ensureEmailIndex();

  let scanned = 0;
  let indexed = 0;
  let failed = 0;

  let lastCreatedAt: Date | undefined;
  let lastId: string | undefined;

  while (true) {
    const emails = await prisma.email.findMany({
      take: BATCH_SIZE,
      where: lastCreatedAt && lastId
        ? {
            OR: [
              {
                createdAt: {
                  gt: lastCreatedAt,
                },
              },
              {
                createdAt: lastCreatedAt,
                id: {
                  gt: lastId,
                },
              },
            ],
          }
        : undefined,
      orderBy: [
        {
          createdAt: "asc",
        },
        {
          id: "asc",
        },
      ],
    });

    if (emails.length === 0) {
      break;
    }

    scanned += emails.length;

    try {
      await indexEmailRecords(emails);
      indexed += emails.length;
    } catch (error) {
      failed += emails.length;

      logger.error(
        {
          error,
          batchSize: emails.length,
        },
        "Failed to reconcile Elasticsearch email batch",
      );
    }

    const lastEmail = emails[emails.length - 1];

    lastCreatedAt = lastEmail.createdAt;
    lastId = lastEmail.id;
  }

  return {
    scanned,
    indexed,
    failed,
  };
}

export async function reconcileElasticsearchOnStartup(): Promise<void> {
  const result = await reconcileElasticsearchIndex();

  logger.info(
    result,
    "Elasticsearch reconciliation completed",
  );
}