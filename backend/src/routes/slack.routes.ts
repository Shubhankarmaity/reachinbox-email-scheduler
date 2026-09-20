import { Router } from "express";

import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  connectSlack,
  disconnectSlackController,
  getSlackStatus,
  slackCallback,
} from "../controllers/slack.controller.js";

const slackRouter = Router();

slackRouter.get(
  "/oauth",
  authMiddleware,
  connectSlack,
);

slackRouter.get(
  "/oauth/callback",
  authMiddleware,
  slackCallback,
);

slackRouter.get(
  "/status",
  authMiddleware,
  getSlackStatus,
);

slackRouter.post(
  "/disconnect",
  authMiddleware,
  disconnectSlackController,
);

export default slackRouter;