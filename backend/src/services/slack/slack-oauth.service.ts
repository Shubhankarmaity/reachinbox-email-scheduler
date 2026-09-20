import { randomBytes } from "node:crypto";
import type { Request } from "express";

import { encryptSecret } from "../../utils/crypto.js";
import { slackRepository } from "../../repositories/slack.repository.js";
import { sessionService } from "../auth/session.service.js";
import {
  exchangeSlackCode,
  getSlackAuthorizationUrl,
} from "../../integrations/slack/slack.client.js";

export interface SlackConnectionResult {
  connected: boolean;
  teamId: string | null;
  teamName: string | null;
  slackUserId: string | null;
}

export function createSlackAuthorizationUrl(
  req: Request,
): string {
  const state = randomBytes(32).toString("hex");

  sessionService.setSlackOAuthState(req, state);

  return getSlackAuthorizationUrl(state);
}

export async function handleSlackCallback(
  req: Request,
  userId: string,
  code: string,
  state: string,
): Promise<SlackConnectionResult> {
  const storedState =
    sessionService.getSlackOAuthState(req);

  if (!storedState || storedState !== state) {
    throw new Error(
      "Invalid or expired Slack OAuth state.",
    );
  }

  sessionService.clearSlackOAuthState(req);

  const oauthResult = await exchangeSlackCode(code);

  const encryptedAccessToken =
    encryptSecret(oauthResult.accessToken);

  await slackRepository.upsert({
    userId,
    teamId: oauthResult.teamId,
    teamName: oauthResult.teamName,
    slackUserId: oauthResult.slackUserId,
    encryptedAccessToken,
  });

  return {
    connected: true,
    teamId: oauthResult.teamId,
    teamName: oauthResult.teamName,
    slackUserId: oauthResult.slackUserId,
  };
}

export async function getSlackConnection(
  userId: string,
): Promise<SlackConnectionResult> {
  const connection =
    await slackRepository.findByUserId(userId);

  if (!connection) {
    return {
      connected: false,
      teamId: null,
      teamName: null,
      slackUserId: null,
    };
  }

  return {
    connected: true,
    teamId: connection.teamId,
    teamName: connection.teamName,
    slackUserId: connection.slackUserId,
  };
}

export async function disconnectSlack(
  userId: string,
): Promise<void> {
  await slackRepository.disconnect(userId);
}