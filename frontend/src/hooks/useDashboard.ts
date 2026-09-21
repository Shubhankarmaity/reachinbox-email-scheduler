import { useCallback, useEffect, useState } from "react";

import { emailApi, searchApi, senderApi } from "../lib/api";
import { Email, Sender } from "../types";

interface DashboardData {
  scheduledCount: number;
  sentCount: number;
  failedCount: number;
  senderCount: number;
  recentEmails: Email[];
  activeSenders: Sender[];
}

interface UseDashboardResult extends DashboardData {
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

function getItems(payload: any): any[] {
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.data?.items)) {
    return payload.data.items;
  }

  return [];
}

function getTotal(payload: any): number {
  if (typeof payload?.data?.pagination?.total === "number") {
    return payload.data.pagination.total;
  }

  if (typeof payload?.data?.total === "number") {
    return payload.data.total;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data.length;
  }

  return 0;
}

export function useDashboard(): UseDashboardResult {
  const [data, setData] = useState<DashboardData>({
    scheduledCount: 0,
    sentCount: 0,
    failedCount: 0,
    senderCount: 0,
    recentEmails: [],
    activeSenders: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        scheduledResponse,
        sentResponse,
        senderResponse,
      ] = await Promise.all([
        emailApi.scheduled(1, 5),
        emailApi.sent(1, 5),
        senderApi.list(),
      ]);

      // Failed count via Elasticsearch — graceful fallback if ES is down
      let failedPayload: any = { success: true, data: [] };
      try {
        const failedResponse = await searchApi.emails({
          status: "FAILED",
        });
        failedPayload = failedResponse.data;
      } catch {
        // Elasticsearch unavailable — not critical for dashboard
      }

      const scheduledPayload = scheduledResponse.data;
      const sentPayload = sentResponse.data;
      const senderPayload = senderResponse.data;

      const scheduledItems = getItems(scheduledPayload);
      const sentItems = getItems(sentPayload);
      const senders = getItems(senderPayload) as Sender[];

      const recentEmails = [
        ...sentItems,
        ...scheduledItems,
      ]
        .sort(
          (a: Email, b: Email) =>
            new Date(b.updatedAt).getTime() -
            new Date(a.updatedAt).getTime(),
        )
        .slice(0, 5) as Email[];

      setData({
        scheduledCount: getTotal(scheduledPayload),
        sentCount: getTotal(sentPayload),
        failedCount: getTotal(failedPayload),
        senderCount: senders.length,
        recentEmails,
        activeSenders: senders.filter(
          (sender) => sender.isActive,
        ),
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load dashboard data.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    ...data,
    loading,
    error,
    refresh,
  };
}