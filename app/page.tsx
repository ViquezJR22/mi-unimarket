"use client";

import { useEffect, useState } from "react";

type Listing = {
  id: string;
  title: string;
  description: string;
  type: "PRODUCT" | "SERVICE";
  category: string;
  price: number;
  location: string | null;
  imageUrl: string | null;
  imageUrls: string[];
};

type User = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MEMBER";
};

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function loadListings() {
      try {
        const response = await fetch("/api/listings");
        if (!response.ok) throw new Error("Error al cargar");

        const data = await response.json();
        setListings(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadListings();
  }, []);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (!response.ok) {
          setUser(null);
          return;
        }

        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error("Error al consultar usuario:", error);
        setUser(null);
      }
    }

    loadUser();
  }, []);

  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      `${listing.title} ${listing.description} ${listing.category}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesType =
      filter === "ALL" || listing.type === filter;

    return matchesSearch && matchesType;
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <a href="/" className="text-2xl font-black text-indigo-700">
            UniMarket
          </a>

          <div className="flex flex-wrap items-center gap-3">
            <span className="hidden text-sm text-slate-500 sm:inline">
              Tu comunidad, tu mercado
            </span>

            {user ? (
              <a
                href={user.role === "ADMIN" ? "/admin" : "/cuenta"}
                className="rounded-xl bg-indigo-50 px-4 py-2 font-semibold text-indigo-700 hover:bg-indigo-100"
              >
                👤 {user.name}
              </a>
            ) : (
              <>
                <a
                  href="/ingresar"
                  className="rounded-xl border border-indigo-700 px-4 py-2 font-semibold text-indigo-700 hover:bg-indigo-50"
                >
                  Iniciar sesión
                </a>

                <a
                  href="/registrarse"
                  className="rounded-xl bg-indigo-700 px-4 py-2 font-semibold text-white hover:bg-indigo-800"
                >
                  Crear cuenta
                </a>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-br from-indigo-700 to-violet-600 px-6 py-16 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 font-semibold text-indigo-200">
            COMPRA · VENDE · OFRECE
          </p>

          <h1 className="max-w-2xl text-4xl font-black md:text-6xl">
            Todo lo que buscas, cerca de ti.
          </h1>

          <p className="mt-5 max-w-xl text-lg text-indigo-100">
            Encuentra productos y descubre servicios ofrecidos por tu comunidad.
          </p>

          <div className="mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar productos o servicios..."
              className="min-w-0 flex-1 rounded-xl bg-white px-5 py-4 text-slate-900 outline-none"
            />

            <a
              href="/publicar"
              className="rounded-xl bg-amber-400 px-6 py-4 text-center font-bold text-slate-900 hover:bg-amber-300"
            >
              + Publicar anuncio
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Explora UniMarket</h2>
            <p className="mt-1 text-slate-500">
              Publicaciones de nuestra comunidad
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { label: "Todo", value: "ALL" },
              { label: "Productos", value: "PRODUCT" },
              { label: "Servicios", value: "SERVICE" },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setFilter(item.value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  filter === item.value
                    ? "bg-indigo-700 text-white"
                    : "bg-white text-slate-700 ring-1 ring-slate-200"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="py-16 text-center text-slate-500">
            Cargando publicaciones...
          </p>
        ) : filteredListings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="text-5xl">🛍️</div>

            <h3 className="mt-4 text-xl font-bold">
              {search || filter !== "ALL"
                ? "No encontramos resultados"
                : "¡Tu mercado comienza aquí!"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-slate-500">
              {search || filter !== "ALL"
                ? "Prueba otra búsqueda o selecciona otra categoría."
                : "Todavía no hay anuncios. Pronto podrás descubrir productos y servicios de tu comunidad."}
            </p>

            <a
              href="/publicar"
              className="mt-6 inline-block rounded-xl bg-indigo-700 px-6 py-3 font-semibold text-white hover:bg-indigo-800"
            >
              Publicar el primer anuncio
            </a>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredListings.map((listing) => {
              const photos =
                listing.imageUrls?.length > 0
                  ? listing.imageUrls
                  : listing.imageUrl
                    ? [listing.imageUrl]
                    : [];

              return (
                <article
                  key={listing.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex h-52 items-center justify-center bg-indigo-50">
                    {photos.length > 0 ? (
                      <div className="flex h-full w-full gap-1 overflow-x-auto snap-x snap-mandatory">
                        {photos.map((photo, index) => (
                          <img
                            key={`${listing.id}-${index}`}
                            src={photo}
                            alt={`${listing.title}, fotografía ${index + 1}`}
                            className="h-full min-w-full snap-center object-cover"
                          />
                        ))}
                      </div>
                    ) : (
                      <span className="text-6xl">
                        {listing.type === "PRODUCT" ? "📦" : "🧑‍💻"}
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                      {listing.type === "PRODUCT" ? "PRODUCTO" : "SERVICIO"}
                    </span>

                    <p className="mt-3 text-sm text-slate-500">
                      {listing.category}
                    </p>

                    <h3 className="mt-1 text-lg font-bold">
                      {listing.title}
                    </h3>

                    <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                      {listing.description}
                    </p>

                    <p className="mt-4 text-2xl font-black text-indigo-700">
                      ₡{listing.price.toLocaleString("es-CR")}
                    </p>

                    {listing.location && (
                      <p className="mt-2 text-sm text-slate-500">
                        📍 {listing.location}
                      </p>
                    )}

                    {photos.length > 1 && (
                      <p className="mt-2 text-xs text-slate-400">
                        Desliza las fotografías para ver las demás ({photos.length})
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <footer className="border-t bg-white px-6 py-8 text-center text-sm text-slate-500">
        ©️ 2026 UniMarket · Compra, vende y conecta.
      </footer>
    </main>
  );
}