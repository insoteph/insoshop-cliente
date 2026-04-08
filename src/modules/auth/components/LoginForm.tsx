"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAdminSession } from "@/modules/auth/providers/AdminSessionProvider";
import { MaterialInput } from "@/modules/core/components/MaterialInput";
import { loginService } from "@/modules/auth/services/login-service";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshCurrentUser } = useAdminSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      await loginService({
        username,
        password,
      });
      await refreshCurrentUser();

      const nextPath = searchParams.get("next");
      router.push(nextPath || "/dashboard");
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "No se pudo iniciar sesión. Verifica tus credenciales."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="w-full max-w-md space-y-5" onSubmit={handleSubmit}>
      <MaterialInput
        id="username"
        type="text"
        label="Usuario"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        required
      />

      <div className="space-y-2">
        <MaterialInput
          id="password"
          type="password"
          label="Contraseña"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>

      {feedback ? (
        <p className="app-alert-error rounded-xl px-3 py-2 text-sm">
          {feedback}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="app-button-primary w-full rounded-xl py-2.5 text-sm font-bold active:scale-[0.98]"
      >
        {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
      </button>
    </form>
  );
}
