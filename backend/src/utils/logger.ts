import pino from "pino";
import { env } from "../config/env.js";

export const logger = pino({
  level: env.NODE_ENV === "development" ? "debug" : "info",

  base: {
    service: "reachinbox-backend",
  },

  timestamp: pino.stdTimeFunctions.isoTime,
});