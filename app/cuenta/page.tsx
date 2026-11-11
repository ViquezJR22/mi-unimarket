"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  avatar: string;
  gender: string | null;
};

type Listing = {
  id: string;
  title: string;
  description: string;
  category: string;
  type: "PRODUCT" | "SERVICE";
  price: number;
  imageUrl: string | null;
  imageUrls: string[];
};

const avatars = [
  { id: "avatar-1", emoji: "👨🏻‍🎓" },
  { id: "avatar-2", emoji: "👩🏻‍🎓" },
  { id: "avatar-3", emoji: "🧑🏻‍💻" },
  { id: "avatar-4", emoji: "👨🏽‍🔬" },
  { id: "avatar-5", emoji: "👩🏽‍🎨" },
  { id: "avatar-6", emoji: "🧑🏽‍🚀" },
];

function genderLabel(gender: string | null) {
  if (gender === "MUJER") return "Mujer";
  if (gender === "HOMBRE") return "Hombre";
  return "Prefiero no indicarlo";
}

export default function CuentaPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("avatar-1");
  const [gender, setGender] = useState("NO_ESPECIFICAR");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [listingsError, setListingsError] = useState("");

useEffect(() => {
  async function loadUser() {
    try {
      const response = await fetch("/api/auth/me", {
        cache: "no-store",
      });

      if (!response.ok) {
        router.replace("/ingresar");
        return;
      }

      const data = await response.json();
      const currentUser = data.user;

      setUser(currentUser);
      setName(currentUser.name);
      setEmail(currentUser.email);
      setAvatar(currentUser.avatar || "avatar-1");
      setGender(currentUser.gender || "NO_ESPECIFICAR");
    } catch {
      setError("No se pudo cargar tu cuenta.");
    } finally {
      setLoading(false);
    }
  }

  loadUser();
}, [router]);

useEffect(() => {
  async function loadListings() {
    try {
      const response = await fetch("/api/listings/mine", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        setListingsError(
          data.error || "No se pudieron cargar tus publicaciones."
        );
        return;
      }

      setListings(data);
    } catch {
      setListingsError("No se pudieron cargar tus publicaciones.");
    } finally {
      setLoadingListings(false);
    }
  }

  loadListings();
}, []);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, avatar, gender }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "No se pudieron guardar los cambios.");
        return;
      }

      setUser(data.user);
      setName(data.user.name);
      setEmail(data.user.email);
      setAvatar(data.user.avatar);
      setGender(data.user.gender || "NO_ESPECIFICAR");
      setEditing(false);
      setMessage("¡Tu perfil se actualizó correctamente!");
    } catch {
      setError("No se pudo conectar con UniMarket.");
    } finally {
      setSaving(false);
    }
  }

  function cancelEditing() {
    if (!user) return;

    setName(user.name);
    setEmail(user.email);
    setAvatar(user.avatar || "avatar-1");
    setGender(user.gender || "NO_ESPECIFICAR");
    setEditing(false);
    setError("");
  }

async function handleDeleteListing(id: string) {
  const confirmed = window.confirm(
    "¿Estás seguro de que deseas eliminar esta publicación?"
  );

  if (!confirmed) return;

  try {
    const response = await fetch(`/api/listings/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "No se pudo eliminar la publicación.");
      return;
    }

    setListings((previous) =>
      previous.filter((listing) => listing.id !== id)
    );
  } catch {
    alert("No se pudo conectar con UniMarket.");
  }
}

  async function handleLogout() {
    setClosing(true);
    setError("");

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("No se pudo cerrar sesión.");
      }

      router.replace("/");
      router.refresh();
    } catch {
      setError("No se pudo cerrar sesión. Intenta nuevamente.");
      setClosing(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        Cargando tu cuenta...
      </main>
    );
  }

  if (!user) {
    return (
      <main className="p-8 text-center">
        {error || "No se encontró tu cuenta."}
      </main>
    );
  }

  const selectedAvatar =
    avatars.find((item) => item.id === avatar)?.emoji || "👤";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <a href="/" className="font-semibold text-indigo-700">
            ← Volver a UniMarket
          </a>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-4xl">
              {selectedAvatar}
            </div>

            <div>
              <h1 className="text-2xl font-black text-slate-900">
                {user.name}
              </h1>
              <p className="text-sm text-slate-500">
                {user.role === "ADMIN" ? "Administrador" : "Miembro UniMarket"}
              </p>
            </div>
          </div>

          {!editing ? (
            <>
              <div className="mt-8 space-y-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Nombre completo</p>
                  <p className="font-semibold">{user.name}</p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Correo electrónico</p>
                  <p className="font-semibold">{user.email}</p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Sexo</p>
                  <p className="font-semibold">
                    {genderLabel(user.gender)}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Tipo de cuenta</p>
                  <p className="font-semibold">
                    {user.role === "ADMIN" ? "Administrador" : "Usuario"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setEditing(true);
                  setMessage("");
                  setError("");
                }}
                className="mt-8 w-full rounded-xl bg-indigo-700 p-3 font-semibold text-white hover:bg-indigo-800"
              >
                Editar mi perfil
              </button>
            </>
          ) : (
            <form onSubmit={handleSave} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block font-semibold">
                  Nombre completo
                </label>
                <input
                  required
                  minLength={2}
                  maxLength={80}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-3"
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-3"
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold">
                  Sexo
                </label>
                <select
                  value={gender}
                  onChange={(event) => setGender(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white p-3"
                >
                  <option value="NO_ESPECIFICAR">
                    Prefiero no indicarlo
                  </option>
                  <option value="MUJER">Mujer</option>
                  <option value="HOMBRE">Hombre</option>
                </select>
              </div>

              <div>
                <p className="mb-3 font-semibold">Escoge tu avatar</p>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                  {avatars.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAvatar(item.id)}
                      aria-label={`Elegir avatar ${item.id}`}
                      aria-pressed={avatar === item.id}
                      className={`rounded-xl border-2 p-3 text-3xl ${
                        avatar === item.id
                          ? "border-indigo-700 bg-indigo-50"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {item.emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-indigo-700 p-3 font-semibold text-white hover:bg-indigo-800 disabled:opacity-50"
                >
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>

                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={saving}
                  className="flex-1 rounded-xl border border-slate-300 p-3 font-semibold text-slate-700"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {!editing && (
  <section className="mt-10 border-t border-slate-200 pt-8">
    <h2 className="text-xl font-black text-slate-900">
      Mis publicaciones
    </h2>

    <p className="mt-1 text-sm text-slate-500">
      Administra los productos y servicios que has publicado.
    </p>

    {loadingListings ? (
      <p className="mt-5 text-slate-500">
        Cargando tus publicaciones...
      </p>
    ) : listingsError ? (
      <p className="mt-5 text-red-600">{listingsError}</p>
    ) : listings.length === 0 ? (
      <p className="mt-5 rounded-xl bg-slate-50 p-5 text-center text-slate-500">
        Todavía no tienes publicaciones.
      </p>
    ) : (
      <div className="mt-5 space-y-4">
        {listings.map((listing) => (
  <article
    key={listing.id}
    className="rounded-xl border border-slate-200 bg-white p-4"
  >
    <button
      type="button"
      onClick={() => router.push(`/publicacion/${listing.id}`)}
      className="block w-full text-left"
    >
      {(listing.imageUrls?.[0] || listing.imageUrl) && (
        <img
          src={listing.imageUrls?.[0] || listing.imageUrl || ""}
          alt={listing.title}
          className="mb-3 h-48 w-full rounded-lg object-cover"
        />
      )}

      <h3 className="font-bold text-slate-900 hover:text-indigo-700">
        {listing.title}
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        {listing.type === "PRODUCT" ? "Producto" : "Servicio"}
        {" · "}
        {listing.category}
      </p>

      <p className="mt-2 font-bold text-indigo-700">
        ₡{listing.price.toLocaleString("es-CR")}
      </p>

      <p className="mt-2 text-sm font-semibold text-indigo-700">
        Ver publicación →
      </p>
    </button>

    <div className="mt-4 flex gap-3">
      <button
        type="button"
        onClick={() =>
          router.push(`/publicar/editar/${listing.id}`)
        }
        className="flex-1 rounded-lg bg-indigo-700 p-2 font-semibold text-white"
      >
        Editar
      </button>

      <button
        type="button"
        onClick={() => handleDeleteListing(listing.id)}
        className="flex-1 rounded-lg border border-red-300 p-2 font-semibold text-red-600"
      >
        Eliminar
      </button>
    </div>
  </article>
))}
      </div>
    )}
  </section>
)}

          {message && (
            <p className="mt-4 rounded-lg bg-green-50 p-3 text-center text-sm text-green-700">
              {message}
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <button
            onClick={handleLogout}
            disabled={closing || saving}
            className="mt-8 w-full rounded-xl bg-red-600 p-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {closing ? "Cerrando sesión..." : "Cerrar sesión"}
          </button>
        </div>
      </div>
    </main>
  );
}