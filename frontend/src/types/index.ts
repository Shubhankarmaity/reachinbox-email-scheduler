export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

export interface Sender {
  id: string;
  email: string;
  displayName: string;
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type EmailStatus =
  | "SCHEDULED"
  | "QUEUED"
  | "PROCESSING"
  | "SENT"
  | "FAILED"
  | "RATE_LIMITED";

export interface Email {
  id: string;
  campaignId: string;
  userId: string;
  senderId: string;
  recipient: string;
  subject: string;
  body: string;
  scheduledAt: string;
  sentAt: string | null;
  failedAt: string | null;
  status: EmailStatus;
  attemptCount: number;
  lastError?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  userId: string;
  name: string;
  subject: string;
  body: string;
  startTime: string;
  delayBetweenEmailsMs: number;
  hourlyLimit: number;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  idempotencyKey?: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  issues?: unknown[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: ApiError;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: Pagination;
  };
  error?: ApiError;
}

export interface SearchFilters {
  query?: string;
  status?: EmailStatus;
  senderId?: string;
  campaignId?: string;
  from?: string;
  to?: string;
}

export interface SlackConnection {
  connected: boolean;
  teamId?: string | null;
  teamName?: string | null;
  slackUserId?: string | null;
}