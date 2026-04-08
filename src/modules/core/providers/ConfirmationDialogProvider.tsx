"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ConfirmationVariant = "primary" | "danger";

type ConfirmationOptions = {
  title?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmationVariant;
};

type ConfirmationDialogContextValue = {
  confirm: (options: ConfirmationOptions) => Promise<boolean>;
};

type DialogState = {
  options: ConfirmationOptions | null;
  isMounted: boolean;
  isVisible: boolean;
};

const CLOSE_ANIMATION_MS = 220;

const ConfirmationDialogContext =
  createContext<ConfirmationDialogContextValue | null>(null);

export function ConfirmationDialogProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [dialogState, setDialogState] = useState<DialogState>({
    options: null,
    isMounted: false,
    isVisible: false,
  });
  const closeTimeoutRef = useRef<number | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const clearCloseTimeout = useCallback(() => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const closeDialog = useCallback(
    (result: boolean) => {
      setDialogState((current) => ({
        ...current,
        isVisible: false,
      }));

      clearCloseTimeout();
      closeTimeoutRef.current = window.setTimeout(() => {
        setDialogState({
          options: null,
          isMounted: false,
          isVisible: false,
        });
      }, CLOSE_ANIMATION_MS);

      if (resolveRef.current) {
        resolveRef.current(result);
        resolveRef.current = null;
      }
    },
    [clearCloseTimeout],
  );

  const confirm = useCallback(
    (options: ConfirmationOptions) => {
      if (resolveRef.current) {
        resolveRef.current(false);
        resolveRef.current = null;
      }

      clearCloseTimeout();
      setDialogState({
        options,
        isMounted: true,
        isVisible: false,
      });

      window.requestAnimationFrame(() => {
        setDialogState((current) => ({
          ...current,
          isVisible: true,
        }));
      });

      return new Promise<boolean>((resolve) => {
        resolveRef.current = resolve;
      });
    },
    [clearCloseTimeout],
  );

  useEffect(() => {
    return () => {
      clearCloseTimeout();
      if (resolveRef.current) {
        resolveRef.current(false);
      }
      resolveRef.current = null;
    };
  }, [clearCloseTimeout]);

  useEffect(() => {
    if (!dialogState.isMounted) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeDialog(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeDialog, dialogState.isMounted]);

  return (
    <ConfirmationDialogContext.Provider value={{ confirm }}>
      {children}

      {dialogState.isMounted && dialogState.options ? (
        <div
          className={`fixed inset-0 z-[140] flex items-center justify-center p-4 transition-opacity duration-200 ${
            dialogState.isVisible
              ? "bg-black/50 opacity-100"
              : "pointer-events-none bg-black/0 opacity-0"
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirmation-dialog-title"
          aria-describedby="confirmation-dialog-description"
          onClick={() => closeDialog(false)}
        >
          <div
            className={`app-card w-[min(92vw,26rem)] rounded-2xl p-5 transition-all duration-200 ${
              dialogState.isVisible
                ? "translate-y-0 scale-100 opacity-100"
                : "translate-y-2 scale-95 opacity-0"
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <h3
              id="confirmation-dialog-title"
              className="text-base font-semibold text-[var(--foreground-strong)]"
            >
              {dialogState.options.title ?? "Confirmar accion"}
            </h3>

            <p
              id="confirmation-dialog-description"
              className="mt-2 text-sm text-[var(--muted)]"
            >
              {dialogState.options.description}
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="app-button-secondary rounded-xl px-4 py-2 text-sm font-medium"
                onClick={() => closeDialog(false)}
              >
                {dialogState.options.cancelLabel ?? "Cancelar"}
              </button>

              <button
                type="button"
                className={`${
                  dialogState.options.variant === "danger"
                    ? "app-button-danger"
                    : "app-button-primary"
                } rounded-xl px-4 py-2 text-sm font-semibold`}
                onClick={() => closeDialog(true)}
              >
                {dialogState.options.confirmLabel ?? "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </ConfirmationDialogContext.Provider>
  );
}

export function useConfirmationDialog() {
  const context = useContext(ConfirmationDialogContext);

  if (!context) {
    throw new Error(
      "useConfirmationDialog debe usarse dentro de ConfirmationDialogProvider.",
    );
  }

  return context;
}
