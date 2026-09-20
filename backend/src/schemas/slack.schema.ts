import { z } from "zod";

export const slackOAuthCallbackSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Slack authorization code is required"),

  state: z
    .string()
    .trim()
    .min(1, "Slack OAuth state is required"),
});

export const slackConnectionStatusSchema = z.object({
  connected: z.boolean(),
});

export type SlackOAuthCallbackRequest = z.infer<
  typeof slackOAuthCallbackSchema
>;

export type SlackConnectionStatus = z.infer<
  typeof slackConnectionStatusSchema
>;