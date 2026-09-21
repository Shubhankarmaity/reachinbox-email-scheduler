import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { env } from "../config/env.js";
import { userRepository } from "../repositories/user.repository.js";
import { googleOAuthCallbackSchema } from "../schemas/auth.schema.js";
import { googleAuthService } from "../services/auth/google-auth.service.js";
import { sessionService } from "../services/auth/session.service.js";

function buildFrontendRedirect(
  path: string,
  params?: Record<string, string>,
): string {
  const url = new URL(
    path,
    env.FRONTEND_URL,
  );

  if (params) {
    for (const [key, value] of Object.entries(
      params,
    )) {
      url.searchParams.set(key, value);
    }
  }

  return url.toString();
}

export async function googleLogin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authorizationUrl =
      await googleAuthService.createAuthorizationUrl(
        req,
      );

    req.session.save((err) => {
      if (err) {
        return next(err);
      }
      res.redirect(authorizationUrl);
    });
  } catch (error) {
    next(error);
  }
}

export async function googleCallback(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed =
      googleOAuthCallbackSchema.safeParse({
        code: req.query.code,
        state: req.query.state,
      });

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: {
          message:
            "Invalid Google OAuth callback.",
          issues: parsed.error.issues,
        },
      });

      return;
    }

    await googleAuthService.handleCallback(
      req,
      parsed.data.code,
      parsed.data.state,
    );

    req.session.save((err) => {
      if (err) {
        return next(err);
      }
      res.redirect(
        buildFrontendRedirect(
          "/dashboard",
          {
            auth: "success",
          },
        ),
      );
    });
  } catch (error) {
    next(error);
  }
}

export async function getCurrentUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const sessionUser =
      sessionService.getUserSession(req);

    if (!sessionUser) {
      res.status(401).json({
        success: false,
        error: {
          message: "Authentication required.",
        },
      });

      return;
    }

    const user =
      await userRepository.findById(
        sessionUser.id,
      );

    if (!user) {
      sessionService.clearUserSession(req);

      res.status(401).json({
        success: false,
        error: {
          message:
            "Session is no longer valid.",
        },
      });

      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await sessionService.destroySession(req);

    res.clearCookie("connect.sid");

    res.status(200).json({
      success: true,
      data: {
        loggedOut: true,
      },
    });
  } catch (error) {
    next(error);
  }
}