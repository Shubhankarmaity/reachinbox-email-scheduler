import type { Request } from "express";

import type { SessionUser } from "../../types/auth.types.js";

const SESSION_USER_KEY = "user";

export class SessionService {
  // ---------------------------------------------------------------------------
  // Authenticated user
  // ---------------------------------------------------------------------------

  setUserSession(
    req: Request,
    user: SessionUser,
  ): void {
    req.session.user = user;
  }

  getUserSession(
    req: Request,
  ): SessionUser | undefined {
    return req.session.user;
  }

  clearUserSession(req: Request): void {
    delete req.session.user;
  }

  // ---------------------------------------------------------------------------
  // Google OAuth state
  // ---------------------------------------------------------------------------

  setGoogleOAuthState(
    req: Request,
    state: string,
  ): void {
    req.session.googleOAuthState = state;
  }

  getGoogleOAuthState(
    req: Request,
  ): string | undefined {
    return req.session.googleOAuthState;
  }

  clearGoogleOAuthState(req: Request): void {
    delete req.session.googleOAuthState;
  }

  // ---------------------------------------------------------------------------
  // Slack OAuth state
  // ---------------------------------------------------------------------------

  setSlackOAuthState(
    req: Request,
    state: string,
  ): void {
    req.session.slackOAuthState = state;
  }

  getSlackOAuthState(
    req: Request,
  ): string | undefined {
    return req.session.slackOAuthState;
  }

  clearSlackOAuthState(req: Request): void {
    delete req.session.slackOAuthState;
  }

  // ---------------------------------------------------------------------------
  // Session destruction
  // ---------------------------------------------------------------------------

  async destroySession(req: Request): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      req.session.destroy((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
}

export const sessionService = new SessionService();

export { SESSION_USER_KEY };