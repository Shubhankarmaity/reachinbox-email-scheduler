import type { Job, JobsOptions } from "bullmq";

import type { EmailJobData } from "./email.types.js";

export const EMAIL_QUEUE_NAME = "email-sending";

export const EMAIL_JOB_NAME = "send-email";

export type EmailQueueJob = Job<
  EmailJobData,
  void,
  typeof EMAIL_JOB_NAME
>;

export interface EmailJobOptions extends JobsOptions {
  jobId: string;
  delay?: number;
}

export interface EmailRescheduleResult {
  shouldReschedule: boolean;
  nextScheduledAt?: Date;
  reason?: "RATE_LIMITED" | "PROVIDER_THROTTLED";
}