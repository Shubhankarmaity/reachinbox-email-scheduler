import { OAuth2Client } from "google-auth-library";

import { env } from "../../config/env.js";

function requireGoogleOAuthConfig(): {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
} {
  if (
    !env.GOOGLE_CLIENT_ID ||
    !env.GOOGLE_CLIENT_SECRET ||
    !env.GOOGLE_CALLBACK_URL
  ) {
    throw new Error(
      "Google OAuth configuration is missing. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL.",
    );
  }

  return {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    callbackUrl: env.GOOGLE_CALLBACK_URL,
  };
}

export function createGoogleOAuthClient(): OAuth2Client {
  const config = requireGoogleOAuthConfig();

  return new OAuth2Client(
    config.clientId,
    config.clientSecret,
    config.callbackUrl,
  );
}

export function getGoogleAuthorizationUrl(
  state: string,
): string {
  const client = createGoogleOAuthClient();

  return client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "openid",
      "email",
      "profile",
    ],
    prompt: "select_account",
    state,
  });
}

export async function exchangeGoogleCode(
  code: string,
): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiryDate?: number;
}> {
  const client = createGoogleOAuthClient();

  const { tokens } = await client.getToken(code);

  if (!tokens.access_token) {
    throw new Error(
      "Google OAuth token exchange did not return an access token",
    );
  }

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token ?? undefined,
    expiryDate: tokens.expiry_date ?? undefined,
  };
}

export async function getGoogleUserInfo(
  accessToken: string,
): Promise<{
  googleId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}> {
  const client = createGoogleOAuthClient();

  client.setCredentials({
    access_token: accessToken,
  });

  const response = await client.request<{
    sub?: string;
    email?: string;
    name?: string;
    picture?: string;
  }>({
    url: "https://www.googleapis.com/oauth2/v3/userinfo",
  });

  const data = response.data;

  if (!data.sub || !data.email || !data.name) {
    throw new Error(
      "Google user profile is missing required fields",
    );
  }

  return {
    googleId: data.sub,
    email: data.email,
    name: data.name,
    avatarUrl: data.picture ?? null,
  };
}