import { Queue } from "bullmq";

import { redis } from "../config/redis.js";
import type { EmailJobData } from "../types/email.types.js";
import {
  EMAIL_JOB_NAME,
  EMAIL_QUEUE_NAME,
} from "./queue.constants.js";
import type { EmailJobOptions } from "../types/queue.types.js";

export const emailQueue = new Queue<
  EmailJobData,
  void,
  typeof EMAIL_JOB_NAME
>(
  EMAIL_QUEUE_NAME,
  {
    connection: redis,

    defaultJobOptions: {
      removeOnComplete: {
        age: 7 * 24 * 60 * 60,
        count: 10_000,
      },

      removeOnFail: {
        age: 30 * 24 * 60 * 60,
        count: 10_000,
      },

      attempts: 1,
    },
  },
);

export async function addEmailJob(
  data: EmailJobData,
  options: EmailJobOptions,
) {
  return emailQueue.add(
    EMAIL_JOB_NAME,
    data,
    options,
  );
}