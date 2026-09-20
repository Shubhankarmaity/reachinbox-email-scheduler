import type { Job, JobsOptions } from "bullmq";

import {
  EMAIL_JOB_NAME,
  EMAIL_QUEUE_NAME,
} from "./queue.constants.js";

import type { EmailJobData } from "../types/email.types.js";

export {
  EMAIL_JOB_NAME,
  EMAIL_QUEUE_NAME,
};

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