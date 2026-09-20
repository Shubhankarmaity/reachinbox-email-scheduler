import { Router } from "express";

import authRouter from "./auth.routes.js";
import emailRouter from "./email.routes.js";
import healthRouter from "./health.routes.js";
import searchRouter from "./search.routes.js";
import senderRouter from "./sender.routes.js";
import slackRouter from "./slack.routes.js";
import bullBoardRouter from "./bull-board.routes.js";

const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/emails", emailRouter);
apiRouter.use("/search", searchRouter);
apiRouter.use("/senders", senderRouter);
apiRouter.use("/slack", slackRouter);
apiRouter.use("/admin/queues", bullBoardRouter);

export default apiRouter;