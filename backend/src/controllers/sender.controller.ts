import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  createSenderSchema,
  updateSenderStatusSchema,
} from "../schemas/sender.schema.js";

import { senderService } from "../services/email/sender.service.js";

function getSenderId(
  req: Request,
): string | undefined {
  const value = req.params.senderId;

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0
    ? trimmed
    : undefined;
}

export async function createSenderController(
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

    const parsed = createSenderSchema.safeParse(
      req.body,
    );

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: {
          message: "Invalid sender configuration.",
          issues: parsed.error.issues,
        },
      });

      return;
    }

    const sender =
      await senderService.createSender({
        ...parsed.data,
        userId: req.user.id,
      });

    res.status(201).json({
      success: true,
      data: sender,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes(
        "sender with this email already exists",
      )
    ) {
      res.status(409).json({
        success: false,
        error: {
          message: error.message,
        },
      });

      return;
    }

    next(error);
  }
}

export async function listSendersController(
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

    const senders =
      await senderService.listSenders(
        req.user.id,
      );

    res.status(200).json({
      success: true,
      data: senders,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateSenderStatusController(
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

    const senderId = getSenderId(req);

    if (!senderId) {
      res.status(400).json({
        success: false,
        error: {
          message: "Invalid sender ID.",
        },
      });

      return;
    }

    const parsed =
      updateSenderStatusSchema.safeParse(
        req.body,
      );

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: {
          message: "Invalid sender status.",
          issues: parsed.error.issues,
        },
      });

      return;
    }

    if (parsed.data.active) {
      await senderService.activateSender(
        senderId,
        req.user.id,
      );
    } else {
      await senderService.deactivateSender(
        senderId,
        req.user.id,
      );
    }

    res.status(200).json({
      success: true,
      data: {
        senderId,
        active: parsed.data.active,
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Sender not found"
    ) {
      res.status(404).json({
        success: false,
        error: {
          message: "Sender not found.",
        },
      });

      return;
    }

    next(error);
  }
}