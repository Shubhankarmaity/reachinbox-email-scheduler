import { env } from "../../config/env.js";
import { sendEtherealEmail } from "../../integrations/ethereal/ethereal.client.js";
import { sendResendEmail } from "../../integrations/resend/resend.client.js";
import { emailRepository } from "../../repositories/email.repository.js";
import { logger } from "../../utils/logger.js";
import { senderService } from "./sender.service.js";

export interface SendEmailResult {
  emailId: string;
  messageId: string;
  previewUrl: string | null;
}

export class EmailService {
  async sendEmail(
    emailId: string,
  ): Promise<SendEmailResult> {
    const email = await emailRepository.findById(emailId);

    if (!email) {
      throw new Error(`Email not found: ${emailId}`);
    }

    // Idempotency guard:
    // Never send an email that is already marked as SENT.
    if (email.status === "SENT") {
      throw new Error(
        `Email has already been sent: ${emailId}`,
      );
    }

    const sender = await senderService.getSenderForUser(
      email.senderId,
      email.userId,
    );

    let result: { messageId: string; previewUrl: string | null };

    if (env.RESEND_API_KEY) {
      logger.info(
        { emailId, recipient: email.recipient, provider: "resend" },
        "Sending email via Resend API",
      );
      result = await sendResendEmail({
        sender: {
          email: sender.email,
          displayName: sender.displayName,
        },
        recipient: email.recipient,
        subject: email.subject,
        body: email.body,
      });
    } else {
      logger.info(
        { emailId, recipient: email.recipient, provider: "ethereal-smtp" },
        "Sending email via Ethereal SMTP",
      );
      result = await sendEtherealEmail({
        sender: {
          email: sender.email,
          displayName: sender.displayName,
          smtpHost: sender.smtpHost,
          smtpPort: sender.smtpPort,
          smtpUsername: sender.smtpUsername,
          smtpPassword: sender.smtpPassword,
        },
        recipient: email.recipient,
        subject: email.subject,
        body: email.body,
      });
    }

    return {
      emailId: email.id,
      messageId: result.messageId,
      previewUrl: result.previewUrl,
    };
  }
}

export const emailService = new EmailService();