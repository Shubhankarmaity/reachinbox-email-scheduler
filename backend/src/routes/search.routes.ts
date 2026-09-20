import { Router } from "express";

import { authMiddleware } from "../middleware/auth.middleware.js";
import { searchEmailController } from "../controllers/search.controller.js";

const searchRouter = Router();

searchRouter.get(
  "/emails",
  authMiddleware,
  searchEmailController,
);

export default searchRouter;