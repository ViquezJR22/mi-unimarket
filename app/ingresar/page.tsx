"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function IngresarPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "No se pudo iniciar sesión.");
        return;
      }

      const meResponse = await fetch("/api/auth/me", {
        cache: "no-store",
      });

      const meData = await meResponse.json();

      if (!meResponse.ok) {
        setError("No se pudo verificar tu sesión.");
        return;
      }

      if (meData.user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/");
      }

      router.refresh();
    } catch {
      setError("No se pudo conectar con UniMarket. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5 rounded-2xl bg-white p-8 shadow-lg"
      >
        <div className="text-center">
          <p className="font-bold text-purple-700">UNIMARKET</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Iniciar sesión
          </h1>
          <p className="mt-2 text-gray-600">
            Ingresa a tu cuenta para continuar.
          </p>
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block font-medium text-gray-700">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
            placeholder="tu@correo.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block font-medium text-gray-700">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
            placeholder="Tu contraseña"
          />
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-purple-700 p-3 font-semibold text-white hover:bg-purple-800 disabled:opacity-50"
        >
          {loading ? "Ingresando..." : "Entrar"}
        </button>

        <p className="text-center text-sm text-gray-500">
          Usa el correo y la contraseña de tu cuenta administrativa.
        </p>
      </form>
    </main>
  );
}