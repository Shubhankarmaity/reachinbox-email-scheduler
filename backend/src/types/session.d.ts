import "express-session";

import type { SessionUser } from "./auth.types.js";

declare module "express-session" {
  interface SessionData {
    user?: SessionUser;

    // OAuth state values used to protect authorization callbacks.
    googleOAuthState?: string;
    slackOAuthState?: string;
  }
}