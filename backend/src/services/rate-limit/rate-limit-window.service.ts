import { redis } from "../../config/redis.js";

const HOUR_IN_MS = 60 * 60 * 1000;
const COUNTER_TTL_MS = HOUR_IN_MS + 60 * 1000;
const NEXT_SEND_TTL_MS = 2 * HOUR_IN_MS;

const RESERVE_SEND_SLOT_SCRIPT = `
local now = tonumber(ARGV[1])
local delay = tonumber(ARGV[2])
local hourlyLimit = tonumber(ARGV[3])
local hourInMs = 3600000

local windowStart = math.floor(now / hourInMs) * hourInMs
local windowEnd = windowStart + hourInMs

local count = tonumber(redis.call("GET", KEYS[1]) or "0")

if count >= hourlyLimit then
  return {0, windowEnd, count}
end

local nextSendAt =
  tonumber(redis.call("GET", KEYS[2]) or "0")

local reservedAt = math.max(now, nextSendAt)
local nextAvailableAt =
  reservedAt + delay

count = redis.call("INCR", KEYS[1])

redis.call(
  "PEXPIRE",
  KEYS[1],
  ${COUNTER_TTL_MS}
)

redis.call(
  "SET",
  KEYS[2],
  tostring(nextAvailableAt),
  "PX",
  ${NEXT_SEND_TTL_MS}
)

return {
  1,
  reservedAt,
  nextAvailableAt,
  windowEnd,
  count
}
`;

export interface SendSlotReservation {
  allowed: boolean;
  reservedAt: Date | null;
  nextAvailableAt: Date | null;
  hourWindowEnd: Date;
  count: number;
}

export class RateLimitWindowService {
  async reserveSendSlot(
    senderId: string,
    hourlyLimit: number,
    delayBetweenEmailsMs: number,
    now = Date.now(),
  ): Promise<SendSlotReservation> {
    const windowStart =
      Math.floor(now / HOUR_IN_MS) *
      HOUR_IN_MS;

    const counterKey =
      `reachinbox:rate-limit:${senderId}:${windowStart}`;

    const nextSendKey =
      `reachinbox:send-slot:${senderId}`;

    const result = (await redis.eval(
      RESERVE_SEND_SLOT_SCRIPT,
      2,
      counterKey,
      nextSendKey,
      String(now),
      String(delayBetweenEmailsMs),
      String(hourlyLimit),
    )) as [
      number,
      number,
      number,
      number,
      number?,
    ];

    const allowed = result[0] === 1;

    if (!allowed) {
      const hourWindowEnd =
        result[1] ??
        windowStart + HOUR_IN_MS;

      return {
        allowed: false,
        reservedAt: null,
        nextAvailableAt:
          new Date(hourWindowEnd),
        hourWindowEnd:
          new Date(hourWindowEnd),
        count: result[2] ?? hourlyLimit,
      };
    }

    const reservedAt =
      result[1] ?? now;

    const nextAvailableAt =
      result[2] ??
      reservedAt +
        delayBetweenEmailsMs;

    const hourWindowEnd =
      result[3] ??
      windowStart + HOUR_IN_MS;

    const count =
      result[4] ?? 0;

    return {
      allowed: true,
      reservedAt:
        new Date(reservedAt),
      nextAvailableAt:
        new Date(nextAvailableAt),
      hourWindowEnd:
        new Date(hourWindowEnd),
      count,
    };
  }
}

export const rateLimitWindowService =
  new RateLimitWindowService();