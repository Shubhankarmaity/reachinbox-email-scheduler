import type { Email } from "@prisma/client";

import {
  bulkIndexEmails,
  deleteIndexedEmail,
  indexEmail,
  updateIndexedEmail,
  type EmailSearchDocument,
} from "../../integrations/elasticsearch/elasticsearch.client.js";

function toSearchDocument(
  email: Email,
): EmailSearchDocument {
  return {
    id: email.id,
    userId: email.userId,
    campaignId: email.campaignId,
    senderId: email.senderId,

    recipient: email.recipient,
    subject: email.subject,
    body: email.body,

    status: email.status,

    scheduledAt: email.scheduledAt.toISOString(),

    sentAt: email.sentAt
      ? email.sentAt.toISOString()
      : null,

    failedAt: email.failedAt
      ? email.failedAt.toISOString()
      : null,

    createdAt: email.createdAt.toISOString(),
    updatedAt: email.updatedAt.toISOString(),
  };
}

export async function indexEmailRecord(
  email: Email,
): Promise<void> {
  await indexEmail(
    toSearchDocument(email),
  );
}

export async function indexEmailRecords(
  emails: Email[],
): Promise<void> {
  if (emails.length === 0) {
    return;
  }

  await bulkIndexEmails(
    emails.map(toSearchDocument),
  );
}

export async function updateEmailIndex(
  email: Email,
): Promise<void> {
  await updateIndexedEmail(
    toSearchDocument(email),
  );
}

export async function removeEmailFromIndex(
  emailId: string,
): Promise<void> {
  await deleteIndexedEmail(emailId);
}