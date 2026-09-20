import { prisma } from "../config/database.js";

export interface CreateSenderInput {
  userId: string;
  email: string;
  displayName?: string | null;
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  encryptedPassword: string;
}

export class SenderRepository {
  async findById(id: string) {
    return prisma.sender.findUnique({
      where: {
        id,
      },
    });
  }

  async findByIdForUser(
    id: string,
    userId: string,
  ) {
    return prisma.sender.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  async findByEmail(
    userId: string,
    email: string,
  ) {
    return prisma.sender.findUnique({
      where: {
        userId_email: {
          userId,
          email,
        },
      },
    });
  }

  async findManyByUser(userId: string) {
    return prisma.sender.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  async findActiveByUser(userId: string) {
    return prisma.sender.findMany({
      where: {
        userId,
        isActive: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  async create(input: CreateSenderInput) {
    return prisma.sender.create({
      data: {
        userId: input.userId,
        email: input.email,
        displayName:
          input.displayName ?? null,
        smtpHost: input.smtpHost,
        smtpPort: input.smtpPort,
        smtpUsername: input.smtpUsername,
        encryptedPassword:
          input.encryptedPassword,
      },
    });
  }

  async deactivate(id: string) {
    return prisma.sender.update({
      where: {
        id,
      },
      data: {
        isActive: false,
      },
    });
  }

  async activate(id: string) {
    return prisma.sender.update({
      where: {
        id,
      },
      data: {
        isActive: true,
      },
    });
  }
}

export const senderRepository =
  new SenderRepository();