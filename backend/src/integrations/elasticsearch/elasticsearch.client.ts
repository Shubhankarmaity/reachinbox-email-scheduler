import type { estypes } from "@elastic/elasticsearch";
import { Client, type ClientOptions } from "@elastic/elasticsearch";

import { env } from "../../config/env.js";
import type {
  EmailSearchFilters,
  EmailSearchResult,
} from "../../types/email.types.js";

const clientOptions: ClientOptions = {
  node: env.ELASTICSEARCH_NODE,
};

if (
  env.ELASTICSEARCH_USERNAME &&
  env.ELASTICSEARCH_PASSWORD
) {
  clientOptions.auth = {
    username: env.ELASTICSEARCH_USERNAME,
    password: env.ELASTICSEARCH_PASSWORD,
  };
}

export const elasticsearch =
  new Client(clientOptions);

export const EMAIL_INDEX_NAME =
  "reachinbox-emails";

export interface EmailSearchDocument {
  id: string;
  userId: string;
  campaignId: string;
  senderId: string;

  recipient: string;
  subject: string;
  body: string;

  status: string;

  scheduledAt: string;
  sentAt: string | null;
  failedAt: string | null;

  createdAt: string;
  updatedAt: string;
}

export async function connectElasticsearch(): Promise<void> {
  await elasticsearch.ping();
}

export async function disconnectElasticsearch(): Promise<void> {
  // Elasticsearch client does not require explicit
  // connection teardown for this application.
}

export async function ensureEmailIndex(): Promise<void> {
  const exists =
    await elasticsearch.indices.exists({
      index: EMAIL_INDEX_NAME,
    });

  if (exists) {
    return;
  }

  await elasticsearch.indices.create({
    index: EMAIL_INDEX_NAME,
    mappings: {
      properties: {
        id: {
          type: "keyword",
        },

        userId: {
          type: "keyword",
        },

        campaignId: {
          type: "keyword",
        },

        senderId: {
          type: "keyword",
        },

        recipient: {
          type: "keyword",
        },

        subject: {
          type: "text",
        },

        body: {
          type: "text",
        },

        status: {
          type: "keyword",
        },

        scheduledAt: {
          type: "date",
        },

        sentAt: {
          type: "date",
        },

        failedAt: {
          type: "date",
        },

        createdAt: {
          type: "date",
        },

        updatedAt: {
          type: "date",
        },
      },
    },
  });
}

export async function indexEmail(
  email: EmailSearchDocument,
): Promise<void> {
  await elasticsearch.index({
    index: EMAIL_INDEX_NAME,
    id: email.id,
    document: email,
    refresh: "wait_for",
  });
}

export async function bulkIndexEmails(
  emails: EmailSearchDocument[],
): Promise<void> {
  if (emails.length === 0) {
    return;
  }

  await ensureEmailIndex();

  const chunkSize = 500;

  for (
    let start = 0;
    start < emails.length;
    start += chunkSize
  ) {
    const chunk = emails.slice(
      start,
      start + chunkSize,
    );

    const operations: Array<
      | estypes.BulkOperationContainer
      | EmailSearchDocument
    > = [];

    for (const email of chunk) {
      operations.push({
        index: {
          _index: EMAIL_INDEX_NAME,
          _id: email.id,
        },
      });

      operations.push(email);
    }

    const response =
      await elasticsearch.bulk({
        operations,
        refresh: "wait_for",
      });

    if (response.errors) {
      const failedItems =
        response.items.filter((item) => {
          const operation =
            item.index ??
            item.create ??
            item.update ??
            item.delete;

          return Boolean(operation?.error);
        });

      throw new Error(
        `Elasticsearch bulk indexing failed for ${failedItems.length} document(s).`,
      );
    }
  }
}

export async function updateIndexedEmail(
  email: EmailSearchDocument,
): Promise<void> {
  await elasticsearch.update({
    index: EMAIL_INDEX_NAME,
    id: email.id,
    doc: email,
    refresh: "wait_for",
  });
}

export async function deleteIndexedEmail(
  emailId: string,
): Promise<void> {
  try {
    await elasticsearch.delete({
      index: EMAIL_INDEX_NAME,
      id: emailId,
      refresh: "wait_for",
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("404")
    ) {
      return;
    }

    throw error;
  }
}

export async function searchIndexedEmails(
  filters: EmailSearchFilters,
): Promise<EmailSearchResult[]> {
  const must: estypes.QueryDslQueryContainer[] = [];

  const filter: estypes.QueryDslQueryContainer[] = [
    {
      term: {
        userId: filters.userId,
      },
    },
  ];

  if (filters.query) {
    must.push({
      multi_match: {
        query: filters.query,
        fields: [
          "recipient",
          "subject",
          "body",
        ],
        fuzziness: "AUTO",
      },
    });
  }

  if (filters.status) {
    filter.push({
      term: {
        status: filters.status,
      },
    });
  }

  if (filters.senderId) {
    filter.push({
      term: {
        senderId: filters.senderId,
      },
    });
  }

  if (filters.campaignId) {
    filter.push({
      term: {
        campaignId: filters.campaignId,
      },
    });
  }

  if (filters.from || filters.to) {
    filter.push({
      range: {
        scheduledAt: {
          ...(filters.from
            ? {
                gte:
                  filters.from.toISOString(),
              }
            : {}),

          ...(filters.to
            ? {
                lte:
                  filters.to.toISOString(),
              }
            : {}),
        },
      },
    });
  }

  const response =
    await elasticsearch.search<EmailSearchDocument>({
      index: EMAIL_INDEX_NAME,

      query: {
        bool: {
          must,
          filter,
        },
      },

      sort: [
        {
          scheduledAt: {
            order: "desc",
          },
        },
      ],
    });

  return response.hits.hits
    .filter(
      (
        hit,
      ): hit is typeof hit & {
        _source: EmailSearchDocument;
      } => Boolean(hit._source),
    )
    .map((hit) => {
      const source = hit._source;

      return {
        id: source.id,
        recipient: source.recipient,
        subject: source.subject,
        senderId: source.senderId,
        campaignId: source.campaignId,
        status: source.status,
        scheduledAt: new Date(
          source.scheduledAt,
        ),
        sentAt: source.sentAt
          ? new Date(source.sentAt)
          : null,
        failedAt: source.failedAt
          ? new Date(source.failedAt)
          : null,
      };
    });
}