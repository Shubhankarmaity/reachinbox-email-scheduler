import { useCallback, useEffect, useState } from "react";

import { senderApi } from "../lib/api";
import { Sender } from "../types";

interface UseSendersResult {
  senders: Sender[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useSenders(): UseSendersResult {
  const [senders, setSenders] = useState<Sender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await senderApi.list();

      const payload = response.data;

      if (!payload?.success) {
        throw new Error(
          payload?.error?.message ||
            "Failed to load senders.",
        );
      }

      const nextSenders = Array.isArray(payload.data)
        ? payload.data
        : [];

      setSenders(nextSenders);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load senders.";

      setError(message);
      setSenders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    senders,
    loading,
    error,
    refresh,
  };
}