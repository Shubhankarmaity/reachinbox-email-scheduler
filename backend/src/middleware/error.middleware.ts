import type { ErrorRequestHandler } from "express";
import { env } from "../config/env.js";

export const errorMiddleware: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next,
): void => {
  console.error(error);

  const isProduction = env.NODE_ENV === "production";

  res.status(500).json({
    success: false,
    error: {
      message:
        isProduction && !(error instanceof Error)
          ? "Internal server error"
          : error instanceof Error
            ? error.message
            : "Internal server error",
    },
  });
};