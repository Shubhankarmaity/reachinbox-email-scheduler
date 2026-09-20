import { Router } from "express";

import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  createSenderController,
  listSendersController,
  updateSenderStatusController,
} from "../controllers/sender.controller.js";

const senderRouter = Router();

senderRouter.post(
  "/",
  authMiddleware,
  createSenderController,
);

senderRouter.get(
  "/",
  authMiddleware,
  listSendersController,
);

senderRouter.patch(
  "/:senderId/status",
  authMiddleware,
  updateSenderStatusController,
);

export default senderRouter;