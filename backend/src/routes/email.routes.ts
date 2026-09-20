import { Router } from "express";

import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  getEmailController,
  getScheduledEmailsController,
  getSentEmailsController,
  scheduleEmailController,
} from "../controllers/email.controller.js";

const emailRouter = Router();

emailRouter.post(
  "/schedule",
  authMiddleware,
  scheduleEmailController,
);

emailRouter.get(
  "/scheduled",
  authMiddleware,
  getScheduledEmailsController,
);

emailRouter.get(
  "/sent",
  authMiddleware,
  getSentEmailsController,
);

emailRouter.get(
  "/:emailId",
  authMiddleware,
  getEmailController,
);

export default emailRouter;