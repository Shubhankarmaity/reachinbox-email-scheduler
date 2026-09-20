import type { EmailStatus } from "@prisma/client";

import {
  emailRepository,
} from "../../repositories/email.repository.js";

export interface PaginatedEmailResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export async function getEmailStatus(
  emailId: string,
  userId: string,
) {
  const email =
    await emailRepository.findByIdForUser(
      emailId,
      userId,
    );

  if (!email) {
    throw new Error("Email not found");
  }

  return email;
}

export async function getScheduledEmails(
  userId: string,
) {
  return emailRepository.findScheduledByUser(
    userId,
  );
}

export async function getSentEmails(
  userId: string,
) {
  return emailRepository.findSentByUser(
    userId,
  );
}

export async function getScheduledEmailsPaginated(
  userId: string,
  page: number,
  limit: number,
): Promise<
  PaginatedEmailResult<Awaited<
    ReturnType<
      typeof emailRepository.findScheduledByUser
    >
  >[number]>
> {
  const skip = (page - 1) * limit;

  const [items, total] =
    await Promise.all([
      emailRepository.findScheduledByUserPaginated(
        userId,
        skip,
        limit,
      ),
      emailRepository.countScheduledByUser(
        userId,
      ),
    ]);

  return {
    items,
    page,
    limit,
    total,
    totalPages:
      Math.ceil(total / limit),
  };
}

export async function getSentEmailsPaginated(
  userId: string,
  page: number,
  limit: number,
): Promise<
  PaginatedEmailResult<Awaited<
    ReturnType<
      typeof emailRepository.findSentByUser
    >
  >[number]>
> {
  const skip = (page - 1) * limit;

  const [items, total] =
    await Promise.all([
      emailRepository.findSentByUserPaginated(
        userId,
        skip,
        limit,
      ),
      emailRepository.countSentByUser(
        userId,
      ),
    ]);

  return {
    items,
    page,
    limit,
    total,
    totalPages:
      Math.ceil(total / limit),
  };
}

export async function getEmailsByStatus(
  userId: string,
  status: EmailStatus,
) {
  const emails =
    await emailRepository.findManyByUser(
      userId,
    );

  return emails.filter(
    (email) => email.status === status,
  );
}