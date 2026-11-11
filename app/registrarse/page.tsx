"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const avatars = [
  { id: "avatar-1", emoji: "👨🏻‍🎓", label: "Estudiante" },
  { id: "avatar-2", emoji: "👩🏻‍🎓", label: "Estudiante" },
  { id: "avatar-3", emoji: "🧑🏻‍💻", label: "Tecnología" },
  { id: "avatar-4", emoji: "👨🏽‍🔬", label: "Ciencia" },
  { id: "avatar-5", emoji: "👩🏽‍🎨", label: "Arte" },
  { id: "avatar-6", emoji: "🧑🏽‍🚀", label: "Explorador" },
];

export default function RegistrarsePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState("avatar-1");
  const [gender, setGender] = useState("NO_ESPECIFICAR");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          avatar,
          gender,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "No se pudo crear la cuenta.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("No se pudo conectar con UniMarket.");
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
            Crear cuenta
          </h1>
          <p className="mt-2 text-gray-600">
            Únete a la comunidad UniMarket.
          </p>
        </div>

        <div>
          <label className="mb-1 block font-medium text-gray-700">
            Nombre completo
          </label>
          <input
            required
            minLength={2}
            maxLength={80}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
            placeholder="Tu nombre"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium text-gray-700">
            Elige tu avatar
          </label>

          <div className="grid grid-cols-3 gap-3">
            {avatars.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setAvatar(item.id)}
                className={`rounded-xl border-2 p-3 text-center transition ${
                  avatar === item.id
                    ? "border-purple-600 bg-purple-50"
                    : "border-gray-200 hover:border-purple-300"
                }`}
              >
                <span className="block text-3xl">{item.emoji}</span>
                <span className="mt-1 block text-xs text-gray-600">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block font-medium text-gray-700">
            Sexo
          </label>

          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
          >
            <option value="NO_ESPECIFICAR">Prefiero no indicarlo</option>
            <option value="MUJER">Mujer</option>
            <option value="HOMBRE">Hombre</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block font-medium text-gray-700">
            Correo electrónico
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
            placeholder="tu@correo.com"
          />
        </div>

        <div>
          <label className="mb-1 block font-medium text-gray-700">
            Contraseña
          </label>
          <input
            type="password"
            required
            minLength={8}
            maxLength={72}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
            placeholder="Mínimo 8 caracteres"
          />
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-purple-700 p-3 font-semibold text-white hover:bg-purple-800 disabled:opacity-50"
        >
          {loading ? "Creando cuenta..." : "Registrarme"}
        </button>

        <p className="text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?{" "}
          <Link href="/ingresar" className="font-semibold text-purple-700">
            Inicia sesión
          </Link>
        </p>
      </form>
    </main>
  );
}