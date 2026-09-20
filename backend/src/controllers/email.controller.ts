import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { scheduleEmailSchema } from "../schemas/email.schema.js";

import {
  emailSchedulerService,
} from "../services/email/email-scheduler.service.js";

import {
  getEmailStatus,
  getScheduledEmailsPaginated,
  getSentEmailsPaginated,
} from "../services/email/email-status.service.js";

function getIdempotencyKey(
  req: Request,
): string | undefined {
  const value =
    req.get("Idempotency-Key");

  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0
    ? trimmed
    : undefined;
}

function getEmailId(
  req: Request,
): string | undefined {
  const value = req.params.emailId;

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0
    ? trimmed
    : undefined;
}

function getPagination(
  req: Request,
): {
  page: number;
  limit: number;
} | null {
  const rawPage = req.query.page;
  const rawLimit = req.query.limit;

  const pageValue =
    typeof rawPage === "string"
      ? Number(rawPage)
      : 1;

  const limitValue =
    typeof rawLimit === "string"
      ? Number(rawLimit)
      : 50;

  if (
    !Number.isInteger(pageValue) ||
    !Number.isInteger(limitValue)
  ) {
    return null;
  }

  if (
    pageValue < 1 ||
    limitValue < 1 ||
    limitValue > 100
  ) {
    return null;
  }

  return {
    page: pageValue,
    limit: limitValue,
  };
}

export async function scheduleEmailController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          message:
            "Authentication required.",
        },
      });

      return;
    }

    const parsed =
      scheduleEmailSchema.safeParse(
        req.body,
      );

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: {
          message:
            "Invalid email scheduling request.",
          issues:
            parsed.error.issues,
        },
      });

      return;
    }

    const result =
      await emailSchedulerService.scheduleEmails(
        {
          ...parsed.data,
          userId: req.user.id,
        },
        getIdempotencyKey(req),
      );

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getScheduledEmailsController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          message:
            "Authentication required.",
        },
      });

      return;
    }

    const pagination =
      getPagination(req);

    if (!pagination) {
      res.status(400).json({
        success: false,
        error: {
          message:
            "Invalid pagination. page must be >= 1 and limit must be between 1 and 100.",
        },
      });

      return;
    }

    const result =
      await getScheduledEmailsPaginated(
        req.user.id,
        pagination.page,
        pagination.limit,
      );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSentEmailsController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          message:
            "Authentication required.",
        },
      });

      return;
    }

    const pagination =
      getPagination(req);

    if (!pagination) {
      res.status(400).json({
        success: false,
        error: {
          message:
            "Invalid pagination. page must be >= 1 and limit must be between 1 and 100.",
        },
      });

      return;
    }

    const result =
      await getSentEmailsPaginated(
        req.user.id,
        pagination.page,
        pagination.limit,
      );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getEmailController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          message:
            "Authentication required.",
        },
      });

      return;
    }

    const emailId = getEmailId(req);

    if (!emailId) {
      res.status(400).json({
        success: false,
        error: {
          message:
            "Invalid email ID.",
        },
      });

      return;
    }

    const email =
      await getEmailStatus(
        emailId,
        req.user.id,
      );

    res.status(200).json({
      success: true,
      data: email,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Email not found"
    ) {
      res.status(404).json({
        success: false,
        error: {
          message: "Email not found.",
        },
      });

      return;
    }

    next(error);
  }
}