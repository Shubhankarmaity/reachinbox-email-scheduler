import { prisma } from "../config/database.js";

export interface CreateSlackConnectionInput {
  userId: string;
  teamId?: string | null;
  teamName?: string | null;
  slackUserId?: string | null;
  encryptedAccessToken: string;
}

export interface UpdateSlackConnectionInput {
  teamId?: string | null;
  teamName?: string | null;
  slackUserId?: string | null;
  encryptedAccessToken?: string;
}

export class SlackRepository {
  async findByUserId(userId: string) {
    return prisma.slackConnection.findUnique({
      where: {
        userId,
      },
    });
  }

  async create(input: CreateSlackConnectionInput) {
    return prisma.slackConnection.create({
      data: {
        userId: input.userId,
        teamId: input.teamId ?? null,
        teamName: input.teamName ?? null,
        slackUserId: input.slackUserId ?? null,
        encryptedAccessToken: input.encryptedAccessToken,
      },
    });
  }

  async update(
    userId: string,
    input: UpdateSlackConnectionInput,
  ) {
    return prisma.slackConnection.update({
      where: {
        userId,
      },
      data: input,
    });
  }

  async upsert(input: CreateSlackConnectionInput) {
    return prisma.slackConnection.upsert({
      where: {
        userId: input.userId,
      },
      create: {
        userId: input.userId,
        teamId: input.teamId ?? null,
        teamName: input.teamName ?? null,
        slackUserId: input.slackUserId ?? null,
        encryptedAccessToken: input.encryptedAccessToken,
      },
      update: {
        teamId: input.teamId ?? null,
        teamName: input.teamName ?? null,
        slackUserId: input.slackUserId ?? null,
        encryptedAccessToken: input.encryptedAccessToken,
      },
    });
  }

  async disconnect(userId: string) {
    return prisma.slackConnection.delete({
      where: {
        userId,
      },
    });
  }
}

export const slackRepository = new SlackRepository();