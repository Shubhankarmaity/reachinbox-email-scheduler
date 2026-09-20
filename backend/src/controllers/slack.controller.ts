import type { Request, Response, NextFunction } from "express";

import { slackOAuthCallbackSchema } from "../schemas/slack.schema.js";
import {
  createSlackAuthorizationUrl,
  disconnectSlack,
  getSlackConnection,
  handleSlackCallback,
} from "../services/slack/slack-oauth.service.js";
import { env } from "../config/env.js";

export function connectSlack(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    const authorizationUrl =
      createSlackAuthorizationUrl(req);

    res.redirect(authorizationUrl);
  } catch (error) {
    next(error);
  }
}

export async function slackCallback(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = slackOAuthCallbackSchema.safeParse({
      code: req.query.code,
      state: req.query.state,
    });

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: {
          message: "Invalid Slack OAuth callback.",
          issues: parsed.error.issues,
        },
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          message: "Authentication required.",
        },
      });
      return;
    }

    await handleSlackCallback(
      req,
      req.user.id,
      parsed.data.code,
      parsed.data.state,
    );

    res.redirect(
      `${env.FRONTEND_URL}/dashboard?slack=connected`,
    );
  } catch (error) {
    next(error);
  }
}

export async function getSlackStatus(
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

    const connection = await getSlackConnection(
      req.user.id,
    );

    res.status(200).json({
      success: true,
      data: connection,
    });
  } catch (error) {
    next(error);
  }
}

export async function disconnectSlackController(
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

    await disconnectSlack(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        connected: false,
      },
    });
  } catch (error) {
    next(error);
  }
}