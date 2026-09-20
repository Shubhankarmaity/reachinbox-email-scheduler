import { senderRepository } from "../../repositories/sender.repository.js";
import { notifyRateLimitHit } from "../slack/slack-notification.service.js";
import {
  rateLimitWindowService,
  type SendSlotReservation,
} from "./rate-limit-window.service.js";

export interface RateLimitDecision {
  allowed: boolean;
  hourlyLimit: number;
  currentHourCount: number;
  reservedAt?: Date;
  nextAvailableAt: Date;
  hourWindowEnd: Date;
}

export class RateLimitService {
  async checkAndReserve(
    senderId: string,
    hourlyLimit: number,
    delayBetweenEmailsMs: number,
  ): Promise<RateLimitDecision> {
    if (hourlyLimit < 1) {
      throw new Error(
        "Hourly limit must be at least 1.",
      );
    }

    if (delayBetweenEmailsMs < 0) {
      throw new Error(
        "Email delay cannot be negative.",
      );
    }

    const reservation: SendSlotReservation =
      await rateLimitWindowService.reserveSendSlot(
        senderId,
        hourlyLimit,
        delayBetweenEmailsMs,
      );

    if (reservation.allowed) {
      return {
        allowed: true,
        hourlyLimit,
        currentHourCount:
          reservation.count,
        reservedAt:
          reservation.reservedAt ?? undefined,
        nextAvailableAt:
          reservation.nextAvailableAt ??
          new Date(),
        hourWindowEnd:
          reservation.hourWindowEnd,
      };
    }

    const nextAvailableAt =
      reservation.nextAvailableAt ??
      reservation.hourWindowEnd;

    const sender =
      await senderRepository.findById(
        senderId,
      );

    if (sender) {
      try {
        await notifyRateLimitHit({
          userId: sender.userId,
          senderId,
          hourlyLimit,
          windowEnd:
            reservation.hourWindowEnd,
        });
      } catch {
        // Slack is an auxiliary notification channel.
        // A Slack failure must never break email processing.
      }
    }

    return {
      allowed: false,
      hourlyLimit,
      currentHourCount:
        reservation.count,
      nextAvailableAt,
      hourWindowEnd:
        reservation.hourWindowEnd,
    };
  }
}

export const rateLimitService =
  new RateLimitService();