import { z } from "zod";

export const createSenderSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email()
    .max(255),

  displayName: z
    .string()
    .trim()
    .max(255)
    .optional()
    .nullable(),

  smtpHost: z
    .string()
    .trim()
    .min(1)
    .max(255),

  smtpPort: z
    .coerce
    .number()
    .int()
    .min(1)
    .max(65535),

  smtpUsername: z
    .string()
    .trim()
    .min(1)
    .max(255),

  smtpPassword: z
    .string()
    .min(1)
    .max(1000),
});

export const updateSenderStatusSchema = z.object({
  active: z.boolean(),
});

export type CreateSenderInput = z.infer<
  typeof createSenderSchema
>;

export type UpdateSenderStatusInput = z.infer<
  typeof updateSenderStatusSchema
>;