import type {
  NextFunction,
  Request,
  Response,
} from "express";

import type {
  EmailSearchFilters,
} from "../types/email.types.js";

import {
  searchEmails,
} from "../services/search/email-search.service.js";

const EMAIL_STATUSES: NonNullable<
  EmailSearchFilters["status"]
>[] = [
  "SCHEDULED",
  "QUEUED",
  "PROCESSING",
  "SENT",
  "FAILED",
  "RATE_LIMITED",
];

function getQueryValue(
  value: unknown,
): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0
    ? trimmed
    : undefined;
}

function getDateValue(
  value: unknown,
): Date | undefined {
  const stringValue = getQueryValue(value);

  if (!stringValue) {
    return undefined;
  }

  const date = new Date(stringValue);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date;
}

function getStatusValue(
  value: unknown,
): NonNullable<EmailSearchFilters["status"]>
  | undefined {
  const status = getQueryValue(value);

  if (!status) {
    return undefined;
  }

  return EMAIL_STATUSES.includes(
    status as NonNullable<
      EmailSearchFilters["status"]
    >,
  )
    ? (status as NonNullable<
        EmailSearchFilters["status"]
      >)
    : undefined;
}

export async function searchEmailController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          message: "Authentication required.",
        },
      });

      return;
    }

    const query = getQueryValue(req.query.query);
    const status = getStatusValue(req.query.status);
    const senderId = getQueryValue(
      req.query.senderId,
    );
    const campaignId = getQueryValue(
      req.query.campaignId,
    );
    const from = getDateValue(req.query.from);
    const to = getDateValue(req.query.to);

    if (
      req.query.status !== undefined &&
      !status
    ) {
      res.status(400).json({
        success: false,
        error: {
          message: "Invalid email status.",
          allowedValues: EMAIL_STATUSES,
        },
      });

      return;
    }

    if (
      req.query.from !== undefined &&
      !from
    ) {
      res.status(400).json({
        success: false,
        error: {
          message: "Invalid from date.",
        },
      });

      return;
    }

    if (
      req.query.to !== undefined &&
      !to
    ) {
      res.status(400).json({
        success: false,
        error: {
          message: "Invalid to date.",
        },
      });

      return;
    }

    if (from && to && from > to) {
      res.status(400).json({
        success: false,
        error: {
          message:
            "The from date must be before the to date.",
        },
      });

      return;
    }

    const results = await searchEmails({
      userId: req.user.id,
      query,
      status,
      senderId,
      campaignId,
      from,
      to,
    });

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
}