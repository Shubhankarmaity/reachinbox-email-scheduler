import { Router } from "express";

import {
  getCurrentUser,
  googleCallback,
  googleLogin,
  logout,
} from "../controllers/auth.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

const authRouter = Router();

// Google OAuth must remain public because the user
// has no authenticated session when starting login.
authRouter.get(
  "/google",
  googleLogin,
);

authRouter.get(
  "/google/callback",
  googleCallback,
);

// Authenticated session endpoints.
authRouter.get(
  "/me",
  authMiddleware,
  getCurrentUser,
);

authRouter.post(
  "/logout",
  authMiddleware,
  logout,
);

export default authRouter;