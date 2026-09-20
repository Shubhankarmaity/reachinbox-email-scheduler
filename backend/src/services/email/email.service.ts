import { sendEtherealEmail } from "../../integrations/ethereal/ethereal.client.js";
import { emailRepository } from "../../repositories/email.repository.js";
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

    const result = await sendEtherealEmail({
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

    return {
      emailId: email.id,
      messageId: result.messageId,
      previewUrl: result.previewUrl,
    };
  }
}

export const emailService = new EmailService();