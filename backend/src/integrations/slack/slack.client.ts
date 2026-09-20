import { env } from "../../config/env.js";

const SLACK_AUTHORIZE_URL = "https://slack.com/oauth/v2/authorize";
const SLACK_TOKEN_URL = "https://slack.com/api/oauth.v2.access";
const SLACK_POST_MESSAGE_URL = "https://slack.com/api/chat.postMessage";
const SLACK_OPEN_CONVERSATION_URL =
  "https://slack.com/api/conversations.open";

const SLACK_SCOPES = [
  "chat:write",
  "im:write",
].join(",");

interface SlackApiResponse {
  ok: boolean;
  error?: string;
  [key: string]: unknown;
}

export interface SlackOAuthExchangeResult {
  accessToken: string;
  teamId: string | null;
  teamName: string | null;
  slackUserId: string | null;
}

export interface SlackMessageResult {
  channelId: string;
  messageTs: string;
}

function assertSlackConfiguration(): void {
  if (
    !env.SLACK_CLIENT_ID ||
    !env.SLACK_CLIENT_SECRET ||
    !env.SLACK_REDIRECT_URI
  ) {
    throw new Error(
      "Slack OAuth is not configured. Set SLACK_CLIENT_ID, SLACK_CLIENT_SECRET, and SLACK_REDIRECT_URI.",
    );
  }
}

async function parseSlackResponse(
  response: Response,
): Promise<SlackApiResponse> {
  const data = (await response.json()) as SlackApiResponse;

  if (!response.ok) {
    throw new Error(
      `Slack API request failed with HTTP ${response.status}.`,
    );
  }

  if (!data.ok) {
    throw new Error(
      `Slack API error: ${data.error ?? "unknown_error"}`,
    );
  }

  return data;
}

export function getSlackAuthorizationUrl(
  state: string,
): string {
  assertSlackConfiguration();

  const url = new URL(SLACK_AUTHORIZE_URL);

  url.searchParams.set("client_id", env.SLACK_CLIENT_ID!);
  url.searchParams.set("redirect_uri", env.SLACK_REDIRECT_URI!);
  url.searchParams.set("state", state);
  url.searchParams.set("scope", SLACK_SCOPES);

  return url.toString();
}

export async function exchangeSlackCode(
  code: string,
): Promise<SlackOAuthExchangeResult> {
  assertSlackConfiguration();

  const body = new URLSearchParams({
    client_id: env.SLACK_CLIENT_ID!,
    client_secret: env.SLACK_CLIENT_SECRET!,
    code,
    redirect_uri: env.SLACK_REDIRECT_URI!,
  });

  const response = await fetch(SLACK_TOKEN_URL, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const data = await parseSlackResponse(response);

  const accessToken =
    typeof data.access_token === "string"
      ? data.access_token
      : null;

  if (!accessToken) {
    throw new Error(
      "Slack OAuth succeeded but no access token was returned.",
    );
  }

  const team =
    typeof data.team === "object" &&
    data.team !== null
      ? (data.team as Record<string, unknown>)
      : {};

  const authedUser =
    typeof data.authed_user === "object" &&
    data.authed_user !== null
      ? (data.authed_user as Record<string, unknown>)
      : {};

  return {
    accessToken,
    teamId:
      typeof team.id === "string"
        ? team.id
        : null,
    teamName:
      typeof team.name === "string"
        ? team.name
        : null,
    slackUserId:
      typeof authedUser.id === "string"
        ? authedUser.id
        : null,
  };
}

async function openDirectConversation(
  accessToken: string,
  slackUserId: string,
): Promise<string> {
  const response = await fetch(
    SLACK_OPEN_CONVERSATION_URL,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "content-type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        users: slackUserId,
      }),
    },
  );

  const data = await parseSlackResponse(response);

  const channel =
    typeof data.channel === "object" &&
    data.channel !== null
      ? (data.channel as Record<string, unknown>)
      : {};

  const channelId =
    typeof channel.id === "string"
      ? channel.id
      : null;

  if (!channelId) {
    throw new Error(
      "Slack did not return a direct-message channel.",
    );
  }

  return channelId;
}

export async function sendSlackDirectMessage(
  accessToken: string,
  slackUserId: string,
  text: string,
): Promise<SlackMessageResult> {
  const channelId = await openDirectConversation(
    accessToken,
    slackUserId,
  );

  const response = await fetch(
    SLACK_POST_MESSAGE_URL,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "content-type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        channel: channelId,
        text,
      }),
    },
  );

  const data = await parseSlackResponse(response);

  const returnedChannelId =
    typeof data.channel === "string"
      ? data.channel
      : channelId;

  const messageTs =
    typeof data.ts === "string"
      ? data.ts
      : "";

  return {
    channelId: returnedChannelId,
    messageTs,
  };
}