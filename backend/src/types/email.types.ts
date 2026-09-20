export interface ScheduleEmailInput {
  userId: string;
  senderId: string;
  subject: string;
  body: string;
  recipients: string[];
  startTime: Date;
  delayBetweenEmailsMs: number;
  hourlyLimit: number;
  campaignName?: string | null;
}

export interface EmailJobData {
  emailId: string;
  campaignId: string;
  userId: string;
  senderId: string;

  recipient: string;
  subject: string;
  body: string;

  scheduledAt: string;

  delayBetweenEmailsMs: number;
  hourlyLimit: number;
}

export interface EmailSearchFilters {
  userId: string;
  query?: string;
  status?: "SCHEDULED" | "QUEUED" | "PROCESSING" | "SENT" | "FAILED" | "RATE_LIMITED";
  senderId?: string;
  campaignId?: string;
  from?: Date;
  to?: Date;
}

export interface EmailSearchResult {
  id: string;
  recipient: string;
  subject: string;
  senderId: string;
  campaignId: string;
  status: string;
  scheduledAt: Date;
  sentAt: Date | null;
  failedAt: Date | null;
}