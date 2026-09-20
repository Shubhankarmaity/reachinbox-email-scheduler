import { createHash } from "node:crypto";

export function createEmailJobId(
  emailId: string,
): string {
  return `email-${emailId}`;
}

export function createScopedIdempotencyKey(
  userId: string,
  clientIdempotencyKey: string,
): string {
  const normalizedKey =
    clientIdempotencyKey.trim();

  return createHash("sha256")
    .update(
      `${userId}:${normalizedKey}`,
      "utf8",
    )
    .digest("hex");
}