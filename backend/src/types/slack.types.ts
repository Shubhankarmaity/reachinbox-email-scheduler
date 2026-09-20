export interface SlackOAuthResult {
  accessToken: string;
  teamId: string | null;
  teamName: string | null;
  slackUserId: string | null;
}

export interface SlackConnectionData {
  userId: string;
  teamId: string | null;
  teamName: string | null;
  slackUserId: string | null;
  accessToken: string;
}

export interface SlackRateLimitNotification {
  senderId: string;
  senderEmail: string;
  hourlyLimit: number;
  hourWindowStart: Date;
  nextAvailableAt: Date;
  delayedEmailCount: number;
}