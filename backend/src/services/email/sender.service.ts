import {
  encryptSecret,
  decryptSecret,
} from "../../utils/crypto.js";

import {
  senderRepository,
} from "../../repositories/sender.repository.js";

export interface CreateSenderServiceInput {
  userId: string;
  email: string;
  displayName?: string | null;
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
}

export interface SenderCredentials {
  id: string;
  email: string;
  displayName: string | null;
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
}

function toPublicSender(sender: {
  id: string;
  email: string;
  displayName: string | null;
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: sender.id,
    email: sender.email,
    displayName: sender.displayName,
    smtpHost: sender.smtpHost,
    smtpPort: sender.smtpPort,
    smtpUsername: sender.smtpUsername,
    isActive: sender.isActive,
    createdAt: sender.createdAt,
    updatedAt: sender.updatedAt,
  };
}

export class SenderService {
  async createSender(
    input: CreateSenderServiceInput,
  ) {
    const normalizedEmail =
      input.email.trim().toLowerCase();

    const existingSender =
      await senderRepository.findByEmail(
        input.userId,
        normalizedEmail,
      );

    if (existingSender) {
      throw new Error(
        "A sender with this email already exists.",
      );
    }

    const encryptedPassword =
      encryptSecret(input.smtpPassword);

    const sender =
      await senderRepository.create({
        userId: input.userId,
        email: normalizedEmail,
        displayName:
          input.displayName?.trim() || null,
        smtpHost: input.smtpHost.trim(),
        smtpPort: input.smtpPort,
        smtpUsername:
          input.smtpUsername.trim(),
        encryptedPassword,
      });

    return toPublicSender(sender);
  }

  async getSenderForUser(
    senderId: string,
    userId: string,
  ): Promise<SenderCredentials> {
    const sender =
      await senderRepository.findByIdForUser(
        senderId,
        userId,
      );

    if (!sender) {
      throw new Error("Sender not found");
    }

    if (!sender.isActive) {
      throw new Error("Sender is inactive");
    }

    return {
      id: sender.id,
      email: sender.email,
      displayName: sender.displayName,
      smtpHost: sender.smtpHost,
      smtpPort: sender.smtpPort,
      smtpUsername: sender.smtpUsername,
      smtpPassword: decryptSecret(
        sender.encryptedPassword,
      ),
    };
  }

  async listSenders(userId: string) {
    const senders =
      await senderRepository.findManyByUser(
        userId,
      );

    return senders.map(toPublicSender);
  }

  async listActiveSenders(userId: string) {
    const senders =
      await senderRepository.findActiveByUser(
        userId,
      );

    return senders.map(toPublicSender);
  }

  async deactivateSender(
    senderId: string,
    userId: string,
  ): Promise<void> {
    const sender =
      await senderRepository.findByIdForUser(
        senderId,
        userId,
      );

    if (!sender) {
      throw new Error("Sender not found");
    }

    if (!sender.isActive) {
      return;
    }

    await senderRepository.deactivate(
      senderId,
    );
  }

  async activateSender(
    senderId: string,
    userId: string,
  ): Promise<void> {
    const sender =
      await senderRepository.findByIdForUser(
        senderId,
        userId,
      );

    if (!sender) {
      throw new Error("Sender not found");
    }

    if (sender.isActive) {
      return;
    }

    await senderRepository.activate(senderId);
  }
}

export const senderService =
  new SenderService();