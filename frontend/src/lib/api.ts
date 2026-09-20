import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

const api: AxiosInstance = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => config,
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: { message?: string } }>) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent("reachinbox:unauthorized"));
    }

    const message =
      error.response?.data?.error?.message ||
      error.message ||
      "Something went wrong";

    return Promise.reject(new Error(message));
  },
);

export const authApi = {
  me: () => api.get("/auth/me"),

  googleLogin: () => {
    window.location.href = "/api/auth/google";
  },

  logout: () => api.post("/auth/logout"),
};

export const senderApi = {
  list: () => api.get("/senders"),

  create: (payload: {
    email: string;
    displayName: string;
    smtpHost: string;
    smtpPort: number;
    smtpUsername: string;
    smtpPassword: string;
  }) => api.post("/senders", payload),

  updateStatus: (senderId: string, isActive: boolean) =>
    api.patch(`/senders/${senderId}/status`, { isActive }),
};

export const emailApi = {
  scheduled: (page = 1, limit = 20) =>
    api.get("/emails/scheduled", {
      params: { page, limit },
    }),

  sent: (page = 1, limit = 20) =>
    api.get("/emails/sent", {
      params: { page, limit },
    }),

  getById: (emailId: string) =>
    api.get(`/emails/${emailId}`),

  schedule: (
    payload: {
      senderId: string;
      subject: string;
      body: string;
      recipients: string[];
      startTime: string;
      delayBetweenEmailsMs: number;
      hourlyLimit: number;
      campaignName?: string;
    },
    idempotencyKey: string,
  ) =>
    api.post("/emails/schedule", payload, {
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
    }),
};

export const searchApi = {
  emails: (params: {
    query?: string;
    status?: string;
    senderId?: string;
    campaignId?: string;
    from?: string;
    to?: string;
  }) =>
    api.get("/search/emails", {
      params,
    }),
};

export const slackApi = {
  status: () => api.get("/slack/status"),

  connect: () => {
    window.location.href = "/api/slack/oauth";
  },

  disconnect: () => api.post("/slack/disconnect"),
};

export default api;