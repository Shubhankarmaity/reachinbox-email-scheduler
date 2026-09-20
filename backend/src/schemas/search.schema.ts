import { z } from "zod";

const emailStatusSchema = z.enum([
  "SCHEDULED",
  "QUEUED",
  "PROCESSING",
  "SENT",
  "FAILED",
  "RATE_LIMITED",
]);

export const emailSearchSchema = z
  .object({
    query: z
      .string()
      .trim()
      .max(500, "Search query must not exceed 500 characters")
      .optional(),

    status: emailStatusSchema.optional(),

    senderId: z
      .string()
      .uuid("senderId must be a valid UUID")
      .optional(),

    campaignId: z
      .string()
      .uuid("campaignId must be a valid UUID")
      .optional(),

    from: z.coerce
      .date()
      .optional(),

    to: z.coerce
      .date()
      .optional(),
  })
  .refine(
    (data) => {
      if (!data.from || !data.to) {
        return true;
      }

      return data.from <= data.to;
    },
    {
      message: "`from` must be earlier than or equal to `to`",
      path: ["from"],
    },
  );

export type EmailSearchRequest = z.infer<
  typeof emailSearchSchema
>;