import { useCallback, useEffect, useState } from "react";

import { slackApi } from "../lib/api";

interface SlackState {
  connected: boolean;
  teamId: string | null;
  teamName: string | null;
  slackUserId: string | null;
}

interface UseSlackResult extends SlackState {
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  connect: () => void;
  disconnect: () => Promise<void>;
}

const initialState: SlackState = {
  connected: false,
  teamId: null,
  teamName: null,
  slackUserId: null,
};

function normalizeStatus(payload: any): SlackState {
  const data = payload?.data ?? payload;

  return {
    connected: Boolean(data?.connected),
    teamId: data?.teamId ?? null,
    teamName: data?.teamName ?? null,
    slackUserId: data?.slackUserId ?? null,
  };
}

export function useSlack(): UseSlackResult {
  const [state, setState] =
    useState<SlackState>(initialState);

  const [loading, setLoading] = useState(true);
  const [error, setError] =
    useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await slackApi.status();

      if (!response.data?.success) {
        throw new Error(
          response.data?.error?.message ||
            "Unable to load Slack connection status.",
        );
      }

      setState(normalizeStatus(response.data));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load Slack connection status.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const connect = useCallback(() => {
    slackApi.connect();
  }, []);

  const disconnect = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response =
        await slackApi.disconnect();

      if (!response.data?.success) {
        throw new Error(
          response.data?.error?.message ||
            "Unable to disconnect Slack.",
        );
      }

      setState(initialState);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to disconnect Slack.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    ...state,
    loading,
    error,
    refresh,
    connect,
    disconnect,
  };
}