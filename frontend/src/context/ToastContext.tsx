import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ToastContainer,
  type ToastItem,
  type ToastType,
} from "../components/common/Toast";

interface ToastContextValue {
  showToast: (
    message: string,
    type?: ToastType,
    duration?: number,
  ) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(
  undefined,
);

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) =>
      current.filter((toast) => toast.id !== id),
    );
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const showToast = useCallback(
    (
      message: string,
      type: ToastType = "info",
      duration = 4000,
    ) => {
      const id = crypto.randomUUID();

      setToasts((current) => [
        ...current.slice(-4),
        {
          id,
          message,
          type,
          duration,
        },
      ]);
    },
    [],
  );

  const success = useCallback(
    (message: string, duration?: number) => {
      showToast(message, "success", duration);
    },
    [showToast],
  );

  const error = useCallback(
    (message: string, duration?: number) => {
      showToast(message, "error", duration);
    },
    [showToast],
  );

  const info = useCallback(
    (message: string, duration?: number) => {
      showToast(message, "info", duration);
    },
    [showToast],
  );

  const warning = useCallback(
    (message: string, duration?: number) => {
      showToast(message, "warning", duration);
    },
    [showToast],
  );

  useEffect(() => {
    const handleUnauthorized = () => {
      error("Your session has expired. Please sign in again.");
    };

    window.addEventListener(
      "reachinbox:unauthorized",
      handleUnauthorized,
    );

    return () => {
      window.removeEventListener(
        "reachinbox:unauthorized",
        handleUnauthorized,
      );
    };
  }, [error]);

  const value = useMemo<ToastContextValue>(
    () => ({
      showToast,
      success,
      error,
      info,
      warning,
      dismiss,
      dismissAll,
    }),
    [
      showToast,
      success,
      error,
      info,
      warning,
      dismiss,
      dismissAll,
    ],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <ToastContainer
        toasts={toasts}
        onClose={dismiss}
      />
    </ToastContext.Provider>
  );
}

export function useToastContext(): ToastContextValue {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error(
      "useToastContext must be used inside ToastProvider.",
    );
  }

  return context;
}