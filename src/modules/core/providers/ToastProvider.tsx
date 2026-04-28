"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ToastVariant = "success" | "error" | "warning" | "info";

type ToastOptions = {
  title?: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastItem = Required<Omit<ToastOptions, "title">> & {
  id: string;
  title?: string;
  isClosing: boolean;
  isPaused: boolean;
};

type ToastContextValue = {
  notify: (options: ToastOptions) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);
const DEFAULT_DURATION_MS = 2000;
const EXIT_ANIMATION_MS = 220;

const toastStyles: Record<
  ToastVariant,
  { border: string; background: string; icon: string; iconColor: string }
> = {
  success: {
    border: "border-[color-mix(in_srgb,var(--success)_34%,transparent)]",
    background:
      "bg-[color-mix(in_srgb,var(--success-soft)_82%,var(--panel-strong)_18%)]",
    icon: "/icons/check.svg",
    iconColor: "var(--success)",
  },
  error: {
    border: "border-[color-mix(in_srgb,var(--danger)_34%,transparent)]",
    background:
      "bg-[color-mix(in_srgb,var(--danger-soft)_82%,var(--panel-strong)_18%)]",
    icon: "/icons/cross.svg",
    iconColor: "var(--danger)",
  },
  warning: {
    border: "border-[color-mix(in_srgb,var(--warning)_34%,transparent)]",
    background:
      "bg-[color-mix(in_srgb,var(--warning-soft)_82%,var(--panel-strong)_18%)]",
    icon: "/icons/options.svg",
    iconColor: "var(--warning)",
  },
  info: {
    border: "border-[color-mix(in_srgb,var(--accent)_30%,transparent)]",
    background:
      "bg-[color-mix(in_srgb,var(--accent-soft)_82%,var(--panel-strong)_18%)]",
    icon: "/icons/check.svg",
    iconColor: "var(--accent)",
  },
};

function ToastIcon({ src, color }: { src: string; color: string }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-4 w-4 shrink-0"
      style={{
        backgroundColor: color,
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );
}

function createToastId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeoutRefs = useRef(new Map<string, number>());
  const startedAtRefs = useRef(new Map<string, number>());
  const remainingTimeRefs = useRef(new Map<string, number>());

  const dismiss = useCallback((toastId: string) => {
    const timeoutId = timeoutRefs.current.get(toastId);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutRefs.current.delete(toastId);
    }

    startedAtRefs.current.delete(toastId);
    remainingTimeRefs.current.delete(toastId);

    setToasts((current) =>
      current.map((toast) =>
        toast.id === toastId ? { ...toast, isClosing: true } : toast,
      ),
    );

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== toastId));
    }, EXIT_ANIMATION_MS);
  }, []);

  const startDismissTimer = useCallback(
    (toastId: string, duration: number) => {
      if (duration <= 0) {
        return;
      }

      startedAtRefs.current.set(toastId, performance.now());
      remainingTimeRefs.current.set(toastId, duration);

      const timeoutId = window.setTimeout(() => {
        dismiss(toastId);
      }, duration);
      timeoutRefs.current.set(toastId, timeoutId);
    },
    [dismiss],
  );

  const pauseToast = useCallback((toastId: string) => {
    const timeoutId = timeoutRefs.current.get(toastId);
    const startedAt = startedAtRefs.current.get(toastId);
    const remainingTime = remainingTimeRefs.current.get(toastId);

    if (!timeoutId || startedAt === undefined || remainingTime === undefined) {
      return;
    }

    window.clearTimeout(timeoutId);
    timeoutRefs.current.delete(toastId);
    remainingTimeRefs.current.set(
      toastId,
      Math.max(0, remainingTime - (performance.now() - startedAt)),
    );

    setToasts((current) =>
      current.map((toast) =>
        toast.id === toastId ? { ...toast, isPaused: true } : toast,
      ),
    );
  }, []);

  const resumeToast = useCallback(
    (toastId: string) => {
      const remainingTime = remainingTimeRefs.current.get(toastId);

      if (remainingTime === undefined || remainingTime <= 0) {
        dismiss(toastId);
        return;
      }

      setToasts((current) =>
        current.map((toast) =>
          toast.id === toastId ? { ...toast, isPaused: false } : toast,
        ),
      );
      startDismissTimer(toastId, remainingTime);
    },
    [dismiss, startDismissTimer],
  );

  const notify = useCallback(
    ({
      title,
      message,
      variant = "success",
      duration = DEFAULT_DURATION_MS,
    }: ToastOptions) => {
      const id = createToastId();
      const nextToast: ToastItem = {
        id,
        title,
        message,
        variant,
        duration,
        isClosing: false,
        isPaused: false,
      };

      setToasts((current) => [nextToast, ...current].slice(0, 4));
      startDismissTimer(id, duration);
    },
    [startDismissTimer],
  );

  useEffect(() => {
    const activeTimeouts = timeoutRefs.current;
    const activeStartedAt = startedAtRefs.current;
    const activeRemainingTimes = remainingTimeRefs.current;

    return () => {
      activeTimeouts.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
      activeTimeouts.clear();
      activeStartedAt.clear();
      activeRemainingTimes.clear();
    };
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      notify,
      success: (message, title) => notify({ message, title, variant: "success" }),
      error: (message, title) => notify({ message, title, variant: "error" }),
      warning: (message, title) =>
        notify({ message, title, variant: "warning" }),
      info: (message, title) => notify({ message, title, variant: "info" }),
    }),
    [notify],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        className="pointer-events-none fixed right-4 top-4 z-[220] flex w-[min(92vw,24rem)] flex-col gap-3 sm:right-6 sm:top-6"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => {
          const style = toastStyles[toast.variant];

          return (
            <div
              key={toast.id}
              className={`${style.border} ${style.background} pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-2xl border p-4 text-sm text-[var(--foreground)] shadow-[0_18px_44px_rgba(15,23,42,0.16)] backdrop-blur-xl transition-all duration-200 ${
                toast.isClosing
                  ? "translate-x-4 opacity-0"
                  : "translate-x-0 opacity-100"
              }`}
              role="status"
              onMouseEnter={() => pauseToast(toast.id)}
              onMouseLeave={() => resumeToast(toast.id)}
            >
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--panel-strong)]">
                <ToastIcon src={style.icon} color={style.iconColor} />
              </span>

              <span className="min-w-0 flex-1">
                {toast.title ? (
                  <span className="block font-semibold text-[var(--foreground-strong)]">
                    {toast.title}
                  </span>
                ) : null}
                <span className="mt-0.5 block leading-5 text-[var(--foreground)]">
                  {toast.message}
                </span>
              </span>

              <button
                type="button"
                className="rounded-lg p-1 opacity-80 hover:bg-[var(--panel-muted)] hover:opacity-100"
                aria-label="Cerrar notificacion"
                onClick={() => dismiss(toast.id)}
              >
                <span
                  aria-hidden="true"
                  className="inline-block h-3.5 w-3.5"
                  style={{
                    backgroundColor: "var(--danger)",
                    WebkitMaskImage: "url(/icons/cross.svg)",
                    maskImage: "url(/icons/cross.svg)",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    WebkitMaskPosition: "center",
                    maskPosition: "center",
                    WebkitMaskSize: "contain",
                    maskSize: "contain",
                  }}
                />
              </button>

              <span className="absolute inset-x-0 bottom-0 h-1 bg-[var(--panel-muted)]">
                <span
                  className="block h-full origin-left bg-[var(--accent)]"
                  style={{
                    animation: `toast-progress ${toast.duration}ms linear forwards`,
                    animationPlayState: toast.isPaused ? "paused" : "running",
                  }}
                />
              </span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast debe usarse dentro de ToastProvider.");
  }

  return context;
}
