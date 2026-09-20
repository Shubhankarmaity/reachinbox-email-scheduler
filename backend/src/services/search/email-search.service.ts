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
  await ensureEmailIndex();

  return searchIndexedEmails(filters);
}