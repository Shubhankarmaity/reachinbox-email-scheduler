import dotenv from "dotenv";

dotenv.config({
  override: true,
});
import { z } from "zod";

function cleanString(val: unknown): unknown {
  if (typeof val === "string") {
    const trimmed = val.trim().replace(/^['"]+|['"]+$/g, "");
    return trimmed === "" ? undefined : trimmed;
  }
  return val;
}

const envSchema = z.object({
  // ---------------------------------------------------------------------------
  // Application
  // ---------------------------------------------------------------------------
  NODE_ENV: z
    .preprocess(
      (val) =>
        typeof val === "string"
          ? val.trim().toLowerCase().replace(/^['"]+|['"]+$/g, "")
          : val,
      z.enum(["development", "test", "production"]),
    )
    .default("development"),

  PORT: z.coerce
    .number()
    .int()
    .min(1)
    .max(65535)
    .default(5000),

  FRONTEND_URL: z
    .preprocess(
      cleanString,
      z.string().url("FRONTEND_URL must be a valid URL"),
    )
    .default("http://localhost:5173"),


  // ---------------------------------------------------------------------------
  // Database
  // ---------------------------------------------------------------------------
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // ---------------------------------------------------------------------------
  // Redis / BullMQ
  // ---------------------------------------------------------------------------
  REDIS_URL: z.string().min(1, "REDIS_URL is required"),

  // ---------------------------------------------------------------------------
  // Elasticsearch
  // ---------------------------------------------------------------------------
  ELASTICSEARCH_NODE: z
    .string()
    .url()
    .default("http://localhost:9200"),

  ELASTICSEARCH_USERNAME: z.string().optional(),
  ELASTICSEARCH_PASSWORD: z.string().optional(),

  // ---------------------------------------------------------------------------
  // Session / Authentication
  // ---------------------------------------------------------------------------
  SESSION_SECRET: z
    .string()
    .min(
      32,
      "SESSION_SECRET must contain at least 32 characters",
    ),

  // ---------------------------------------------------------------------------
  GOOGLE_CLIENT_ID: z.preprocess(cleanString, z.string().optional()),
  GOOGLE_CLIENT_SECRET: z.preprocess(cleanString, z.string().optional()),
  GOOGLE_CALLBACK_URL: z.preprocess(cleanString, z.string().url().optional()),

  // ---------------------------------------------------------------------------
  // Slack OAuth
  // ---------------------------------------------------------------------------
  SLACK_CLIENT_ID: z.preprocess(cleanString, z.string().optional()),
  SLACK_CLIENT_SECRET: z.preprocess(cleanString, z.string().optional()),
  SLACK_REDIRECT_URI: z.preprocess(cleanString, z.string().url().optional()),

  // ---------------------------------------------------------------------------
  // Ethereal SMTP
  // ---------------------------------------------------------------------------
  ETHEREAL_HOST: z
    .string()
    .default("smtp.ethereal.email"),

  ETHEREAL_PORT: z.coerce
    .number()
    .int()
    .min(1)
    .max(65535)
    .default(587),

  ETHEREAL_USER: z.string().optional(),
  ETHEREAL_PASSWORD: z.string().optional(),

  // ---------------------------------------------------------------------------
  // Worker configuration
  // ---------------------------------------------------------------------------
  WORKER_CONCURRENCY: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(5),

  // Minimum delay between individual email sends.
  EMAIL_SEND_DELAY_MS: z.coerce
    .number()
    .int()
    .min(0)
    .default(2000),

  // Maximum number of emails allowed per sender in one hour.
  MAX_EMAILS_PER_HOUR_PER_SENDER: z.coerce
    .number()
    .int()
    .min(1)
    .default(200),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment configuration:");

  for (const issue of parsedEnv.error.issues) {
    console.error(
      `- ${issue.path.join(".")}: ${issue.message}`,
    );
  }

  process.exit(1);
}

export const env = parsedEnv.data;