import { z } from "zod";

export const scheduleEmailSchema = z.object({
  senderId: z
    .string()
    .uuid("senderId must be a valid UUID"),

  subject: z
    .string()
    .trim()
    .min(1, "Subject is required")
    .max(255, "Subject must not exceed 255 characters"),

  body: z
    .string()
    .trim()
    .min(1, "Body is required")
    .max(100_000, "Body must not exceed 100,000 characters"),

  recipients: z
    .array(
      z
        .string()
        .trim()
        .email("Each recipient must be a valid email address"),
    )
    .min(1, "At least one recipient is required")
    .max(10_000, "A maximum of 10,000 recipients is allowed"),

  startTime: z.coerce
    .date()
    .refine(
      (date) => date.getTime() > Date.now(),
      "Start time must be in the future",
    ),

  delayBetweenEmailsMs: z
    .coerce
    .number()
    .int("Delay must be an integer")
    .min(0, "Delay cannot be negative")
    .max(
      3_600_000,
      "Delay cannot exceed 1 hour",
    ),

  hourlyLimit: z
    .coerce
    .number()
    .int("Hourly limit must be an integer")
    .min(1, "Hourly limit must be at least 1")
    .max(
      100_000,
      "Hourly limit cannot exceed 100,000",
    ),

  campaignName: z
    .string()
    .trim()
    .max(255, "Campaign name must not exceed 255 characters")
    .optional()
    .nullable(),
});

export type ScheduleEmailRequest = z.infer<
  typeof scheduleEmailSchema
>;