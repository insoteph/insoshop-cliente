"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { MaterialInput } from "@/modules/core/components/MaterialInput";
import { apiFetch } from "@/modules/core/lib/api-client";
import { setAccessToken } from "@/modules/auth/lib/session";

type LoginResponse = {
  token: string;
  expiration: string;
  requirePasswordChange: boolean;
  refreshToken: string | null;
};

export function LoginForm() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await apiFetch<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: {
          userName,
          password,
        },
        auth: false,
      });

      setAccessToken(response.data.token);
      router.push("/dashboard");
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
        id="userName"
        type="text"
        label="Usuario"
        value={userName}
        onChange={(event) => setUserName(event.target.value)}
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
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {feedback}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-blue-600 py-2 text-sm font-bold text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 active:scale-[0.98]"
      >
        {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
      </button>
    </form>
  );
}
