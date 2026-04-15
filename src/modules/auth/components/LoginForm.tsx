"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAdminSession } from "@/modules/auth/providers/AdminSessionProvider";
import { MaterialInput } from "@/modules/core/components/MaterialInput";
import { changePasswordService } from "@/modules/auth/services/change-password-service";
import { loginService } from "@/modules/auth/services/login-service";
import { refreshSession } from "@/modules/auth/services/session-service";

export type AuthStep = "credentials" | "new-password";

type LoginFormProps = {
  onStepChange?: (step: AuthStep) => void;
};

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const PASSWORD_HELPER_TEXT =
  "La contraseña debe tener al menos 8 caracteres e incluir mayúscula, minúscula, número y símbolo.";

export function LoginForm({ onStepChange }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshCurrentUser } = useAdminSession();
  const newPasswordInputRef = useRef<HTMLInputElement | null>(null);
  const [step, setStep] = useState<AuthStep>("credentials");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [loginFeedback, setLoginFeedback] = useState<string | null>(null);
  const [passwordFeedback, setPasswordFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (step === "new-password") {
      newPasswordInputRef.current?.focus();
    }
  }, [step]);

  useEffect(() => {
    onStepChange?.(step);
  }, [onStepChange, step]);

  function resolveNextPath() {
    return searchParams.get("next") || "/dashboard";
  }

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmittingLogin(true);
    setLoginFeedback(null);
    setPasswordFeedback(null);

    try {
      const session = await loginService({
        username,
        password,
      });

      if (session.requirePasswordChange) {
        setStep("new-password");
        return;
      }

      await refreshCurrentUser();
      router.push(resolveNextPath());
    } catch (error) {
      setLoginFeedback(
        error instanceof Error
          ? error.message
          : "No se pudo iniciar sesión. Verifica tus credenciales."
      );
    } finally {
      setIsSubmittingLogin(false);
    }
  }

  async function handleChangePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordFeedback(null);

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setPasswordFeedback("Debes completar y confirmar la nueva contraseña.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordFeedback(
        "La confirmación no coincide con la nueva contraseña."
      );
      return;
    }

    if (!PASSWORD_PATTERN.test(newPassword)) {
      setPasswordFeedback(PASSWORD_HELPER_TEXT);
      return;
    }

    setIsSubmittingPassword(true);

    try {
      await changePasswordService({
        currentPassword: password,
        newPassword,
      });
      await refreshSession();
      await refreshCurrentUser();
      router.replace(resolveNextPath());
      router.refresh();
    } catch (error) {
      setPasswordFeedback(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la contraseña."
      );
    } finally {
      setIsSubmittingPassword(false);
    }
  }

  return (
    <div className="relative w-full max-w-md min-h-[25rem] overflow-hidden">
      <form
        className={`absolute inset-0 space-y-5 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          step === "credentials"
            ? "translate-x-0 opacity-100"
            : "-translate-x-[14%] opacity-0 pointer-events-none"
        }`}
        onSubmit={handleLoginSubmit}
      >
        <MaterialInput
          id="username"
          type="text"
          label="Usuario"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
          required
        />

        <MaterialInput
          id="password"
          type="password"
          label="Contraseña"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />

        {loginFeedback ? (
          <p className="app-alert-error rounded-xl px-3 py-2 text-sm">
            {loginFeedback}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmittingLogin}
          className="app-button-primary w-full rounded-xl py-2.5 text-sm font-bold active:scale-[0.98] disabled:opacity-60"
        >
          {isSubmittingLogin ? "Verificando..." : "Iniciar sesión"}
        </button>
      </form>

      <form
        className={`absolute inset-0 space-y-5 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          step === "new-password"
            ? "translate-x-0 opacity-100"
            : "translate-x-[14%] opacity-0 pointer-events-none"
        }`}
        onSubmit={handleChangePasswordSubmit}
      >
        <div className="app-card-muted rounded-2xl px-4 py-3 text-sm text-[var(--foreground)]">
          Debes actualizar la contraseña del usuario{" "}
          <span className="font-semibold">{username}</span> para continuar.
        </div>

        <MaterialInput
          ref={newPasswordInputRef}
          id="new-password"
          type="password"
          label="Nueva contraseña"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          autoComplete="new-password"
          required
        />

        <MaterialInput
          id="confirm-password"
          type="password"
          label="Confirmar contraseña"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          autoComplete="new-password"
          required
        />

        <p className="text-xs text-[var(--muted)]">{PASSWORD_HELPER_TEXT}</p>

        {passwordFeedback ? (
          <p className="app-alert-error rounded-xl px-3 py-2 text-sm">
            {passwordFeedback}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmittingPassword}
          className="app-button-primary w-full rounded-xl py-2.5 text-sm font-bold active:scale-[0.98] disabled:opacity-60"
        >
          {isSubmittingPassword ? "Actualizando..." : "Actualizar contraseña"}
        </button>
      </form>
    </div>
  );
}
