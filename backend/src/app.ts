import cors from "cors";
import express from "express";
import helmet from "helmet";

import {
  sessionMiddleware,
} from "./config/session.js";

import {
  errorMiddleware,
} from "./middleware/error.middleware.js";

import {
  requestLoggerMiddleware,
} from "./middleware/logger.middleware.js";

import {
  notFoundMiddleware,
} from "./middleware/not-found.middleware.js";

import {
  getHealth,
} from "./health/health.controller.js";

import apiRouter from "./routes/index.js";

export const app = express();

app.set("trust proxy", 1);


app.use(
  requestLoggerMiddleware,
);

app.use(helmet());

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(sessionMiddleware);

app.use(
  express.json({
    limit: "1mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  }),
);

app.use(
  "/api",
  apiRouter,
);

// Liveness endpoint used by Docker.
app.get(
  "/health",
  getHealth,
);

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message:
      "ReachInbox backend is running",
  });
});

app.use(
  notFoundMiddleware,
);

app.use(
  errorMiddleware,
);