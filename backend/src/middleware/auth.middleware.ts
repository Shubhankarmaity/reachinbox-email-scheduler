import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { userRepository } from "../repositories/user.repository.js";
import { sessionService } from "../services/auth/session.service.js";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const sessionUser =
      sessionService.getUserSession(req);

    if (!sessionUser) {
      res.status(401).json({
        success: false,
        error: {
          message: "Authentication required.",
        },
      });

      return;
    }

    const user =
      await userRepository.findById(
        sessionUser.id,
      );

    if (!user) {
      sessionService.clearUserSession(req);

      res.status(401).json({
        success: false,
        error: {
          message:
            "Authentication session is invalid.",
        },
      });

      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
    };

    next();
  } catch (error) {
    next(error);
  }
}