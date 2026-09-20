import { z } from "zod";

export const googleOAuthCallbackSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Authorization code is required"),

  state: z
    .string()
    .trim()
    .min(1, "OAuth state is required"),
});

export const sessionUserSchema = z.object({
  userId: z
    .string()
    .uuid("userId must be a valid UUID"),
});

export type GoogleOAuthCallbackRequest = z.infer<
  typeof googleOAuthCallbackSchema
>;

export type SessionUserRequest = z.infer<
  typeof sessionUserSchema
>;