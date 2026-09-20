import { Router } from "express";

import { bullBoardRouter } from "../integrations/bull-board/bull-board.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const bullBoardRouterContainer = Router();

bullBoardRouterContainer.use(
  authMiddleware,
  bullBoardRouter,
);

export default bullBoardRouterContainer;