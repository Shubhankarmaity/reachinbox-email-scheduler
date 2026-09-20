import { prisma } from "../config/database.js";

export interface CreateGoogleUserInput {
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
}

export class UserRepository {
  async findById(id: string) {
    return prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async findByGoogleId(googleId: string) {
    return prisma.user.findUnique({
      where: {
        googleId,
      },
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async createGoogleUser(input: CreateGoogleUserInput) {
    return prisma.user.create({
      data: {
        googleId: input.googleId,
        email: input.email,
        name: input.name,
        avatarUrl: input.avatarUrl ?? null,
      },
    });
  }

  async updateGoogleUser(
    id: string,
    input: {
      email?: string;
      name?: string;
      avatarUrl?: string | null;
    },
  ) {
    return prisma.user.update({
      where: {
        id,
      },
      data: input,
    });
  }
}

export const userRepository = new UserRepository();