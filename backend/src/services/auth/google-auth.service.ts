import { randomBytes } from "node:crypto";
import type { Request } from "express";

import {
  exchangeGoogleCode,
  getGoogleAuthorizationUrl,
  getGoogleUserInfo,
} from "../../integrations/google/google.client.js";
import { userRepository } from "../../repositories/user.repository.js";
import type {
  AuthenticatedUser,
  GoogleOAuthCallbackResult,
} from "../../types/auth.types.js";
import { sessionService } from "./session.service.js";

function generateOAuthState(): string {
  return randomBytes(32).toString("hex");
}

export class GoogleAuthService {
  async createAuthorizationUrl(
    req: Request,
  ): Promise<string> {
    const state = generateOAuthState();

    sessionService.setGoogleOAuthState(req, state);

    return getGoogleAuthorizationUrl(state);
  }

  async handleCallback(
    req: Request,
    code: string,
    state: string,
  ): Promise<GoogleOAuthCallbackResult> {
    const storedState =
      sessionService.getGoogleOAuthState(req);

    if (!storedState) {
      throw new Error(
        "Google OAuth session state is missing",
      );
    }

    if (storedState !== state) {
      throw new Error(
        "Invalid Google OAuth state",
      );
    }

    // OAuth state is single-use.
    sessionService.clearGoogleOAuthState(req);

    const tokens = await exchangeGoogleCode(code);

    const googleProfile = await getGoogleUserInfo(
      tokens.accessToken,
    );

    let user =
      await userRepository.findByGoogleId(
        googleProfile.googleId,
      );

    let isNewUser = false;

    if (!user) {
      user = await userRepository.findByEmail(
        googleProfile.email,
      );

      if (user) {
        user = await userRepository.updateGoogleUser(
          user.id,
          {
            name: googleProfile.name,
            avatarUrl: googleProfile.avatarUrl,
          },
        );
      } else {
        user = await userRepository.createGoogleUser(
          googleProfile,
        );

        isNewUser = true;
      }
    } else {
      user = await userRepository.updateGoogleUser(
        user.id,
        {
          email: googleProfile.email,
          name: googleProfile.name,
          avatarUrl: googleProfile.avatarUrl,
        },
      );
    }

    const authenticatedUser: AuthenticatedUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
    };

    sessionService.setUserSession(
      req,
      authenticatedUser,
    );

    return {
      profile: googleProfile,
      isNewUser,
    };
  }
}

export const googleAuthService =
  new GoogleAuthService();