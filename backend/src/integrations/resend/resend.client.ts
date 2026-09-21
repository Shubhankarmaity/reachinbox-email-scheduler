import { Resend } from "resend";
import { env } from "../../config/env.js";

export interface ResendSenderInfo {
  email: string;
  displayName: string | null;
}

export interface SendResendEmailInput {
  sender: ResendSenderInfo;
  recipient: string;
  subject: string;
  body: string;
}

export interface SendResendEmailResult {
  messageId: string;
  previewUrl: string | null;
}

let resendInstance: Resend | null = null;

function getResendClient(): Resend {
  if (!env.RESEND_API_KEY) {
    throw new Error(
      "RESEND_API_KEY is not configured in environment variables",
    );
  }

  if (!resendInstance) {
    resendInstance = new Resend(env.RESEND_API_KEY);
  }

  return resendInstance;
}

export async function sendResendEmail(
  input: SendResendEmailInput,
): Promise<SendResendEmailResult> {
  const resend = getResendClient();

  const fromEmail = env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  const from = input.sender.displayName
    ? `"${input.sender.displayName}" <${fromEmail}>`
    : fromEmail;

  const response = await resend.emails.send({
    from,
    to: [input.recipient],
    replyTo: input.sender.email,
    subject: input.subject,
    text: input.body,
  });

  if (response.error) {
    throw new Error(
      `Resend email delivery failed: ${response.error.message}`,
    );
  }

  return {
    messageId: response.data?.id ?? `resend-${Date.now()}`,
    previewUrl: null,
  };
}
