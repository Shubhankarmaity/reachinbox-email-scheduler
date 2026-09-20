import { redis } from "../../config/redis.js";
import { decryptSecret } from "../../utils/crypto.js";
import { slackRepository } from "../../repositories/slack.repository.js";
import { sendSlackDirectMessage } from "../../integrations/slack/slack.client.js";
import { logger } from "../../utils/logger.js";

export interface RateLimitNotificationInput {
  userId: string;
  senderId: string;
  hourlyLimit: number;
  windowEnd: Date;
}

export type RateLimitNotificationResult =
  | { sent: true }
  | { sent: false; reason: "NOT_CONNECTED" | "ALREADY_NOTIFIED" | "FAILED" };

function getNotificationKey(
  senderId: string,
  windowEnd: Date,
): string {
  return `reachinbox:slack:rate-limit:${senderId}:${windowEnd.getTime()}`;
}

export async function notifyRateLimitHit(
  input: RateLimitNotificationInput,
): Promise<RateLimitNotificationResult> {
  const connection =
    await slackRepository.findByUserId(input.userId);

  if (
    !connection ||
    !connection.encryptedAccessToken ||
    !connection.slackUserId
  ) {
    return {
      sent: false,
      reason: "NOT_CONNECTED",
    };
  }

  const notificationKey = getNotificationKey(
    input.senderId,
    input.windowEnd,
  );

  const acquired = await redis.set(
    notificationKey,
    "1",
    "EX",
    60 * 60,
    "NX",
  );

  if (acquired !== "OK") {
    return {
      sent: false,
      reason: "ALREADY_NOTIFIED",
    };
  }

  try {
    const accessToken = decryptSecret(
      connection.encryptedAccessToken,
    );

    await sendSlackDirectMessage(
      accessToken,
      connection.slackUserId,
      [
        "⚠️ ReachInbox rate limit reached.",
        `Sender ID: ${input.senderId}`,
        `Hourly limit: ${input.hourlyLimit}`,
        `The affected email jobs will be delayed and retried automatically.`,
        `Current window ends: ${input.windowEnd.toISOString()}`,
      ].join("\n"),
    );

    return {
      sent: true,
    };
  } catch (error) {
    await redis.del(notificationKey);

    logger.error(
      { error },
      "Failed to send Slack rate-limit notification",
    );

    return {
      sent: false,
      reason: "FAILED",
    };
  }
}