import nodemailer from "nodemailer";

export interface EtherealSenderCredentials {
  email: string;
  displayName: string | null;
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
}

export interface SendEtherealEmailInput {
  sender: EtherealSenderCredentials;
  recipient: string;
  subject: string;
  body: string;
}

export interface SendEtherealEmailResult {
  messageId: string;
  previewUrl: string | null;
}

export async function sendEtherealEmail(
  input: SendEtherealEmailInput,
): Promise<SendEtherealEmailResult> {
  const transporter = nodemailer.createTransport({
    host: input.sender.smtpHost,
    port: input.sender.smtpPort,
    secure: input.sender.smtpPort === 465,
    auth: {
      user: input.sender.smtpUsername,
      pass: input.sender.smtpPassword,
    },
  });

  const info = await transporter.sendMail({
    from: input.sender.displayName
      ? `"${input.sender.displayName}" <${input.sender.email}>`
      : input.sender.email,
    to: input.recipient,
    subject: input.subject,
    text: input.body,
  });

  return {
    messageId: info.messageId,
    previewUrl: nodemailer.getTestMessageUrl(info) || null,
  };
}