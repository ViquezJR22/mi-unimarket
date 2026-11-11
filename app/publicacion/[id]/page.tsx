"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Listing = {
  id: string;
  title: string;
  description: string;
  category: string;
  type: "PRODUCT" | "SERVICE";
  price: number;
  location: string | null;
  imageUrl: string | null;
  imageUrls: string[];
  isOwner: boolean;
  seller: {
    id: string;
    name: string;
    avatar: string;
    gender: string | null;
  };
};

const avatars: Record<string, string> = {
  "avatar-1": "👨🏻‍🎓",
  "avatar-2": "👩🏻‍🎓",
  "avatar-3": "🧑🏻‍💻",
  "avatar-4": "👨🏽‍🔬",
  "avatar-5": "👩🏽‍🎨",
  "avatar-6": "🧑🏽‍🚀",
};

function PublicacionContenido() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [listing, setListing] = useState<Listing | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadListing() {
      try {
        const response = await fetch(
          `/api/listings/${params.id}/detail`,
          { cache: "no-store" }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "No se pudo cargar la publicación.");
          return;
        }

        setListing(data);
      } catch {
        setError("No se pudo conectar con UniMarket.");
      } finally {
        setLoading(false);
      }
    }

    loadListing();
  }, [params.id]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        Cargando publicación...
      </main>
    );
  }

  if (!listing) {
    return (
      <main className="min-h-screen p-8 text-center">
        <p className="text-red-600">
          {error || "Publicación no encontrada."}
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-5 rounded-xl bg-indigo-700 px-5 py-3 text-white"
        >
          Volver a UniMarket
        </button>
      </main>
    );
  }

  const images =
    listing.imageUrls?.length > 0
      ? listing.imageUrls
      : listing.imageUrl
        ? [listing.imageUrl]
        : [];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => router.back()}
          className="mb-6 font-semibold text-indigo-700"
        >
          ← Volver
        </button>

        <div className="grid gap-8 rounded-2xl bg-white p-5 shadow-sm md:grid-cols-2 md:p-8">
          <section>
            {images.length > 0 ? (
              <>
                <img
                  src={images[selectedImage]}
                  alt={listing.title}
                  className="h-80 w-full rounded-xl object-contain bg-slate-100"
                />

                {images.length > 1 && (
                  <div className="mt-3 flex gap-3 overflow-x-auto">
                    {images.map((image, index) => (
                      <button
                        key={image}
                        onClick={() => setSelectedImage(index)}
                        className={`shrink-0 rounded-lg border-2 ${
                          selectedImage === index
                            ? "border-indigo-700"
                            : "border-transparent"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Fotografía ${index + 1}`}
                          className="h-20 w-20 rounded-md object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex h-80 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                Sin fotografías
              </div>
            )}
          </section>

          <section>
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">
              {listing.type === "PRODUCT" ? "Producto" : "Servicio"}
            </span>

            <h1 className="mt-4 text-3xl font-black text-slate-900">
              {listing.title}
            </h1>

            <p className="mt-3 text-2xl font-black text-indigo-700">
              ₡{listing.price.toLocaleString("es-CR")}
            </p>

            <p className="mt-4 text-sm text-slate-500">
              Categoría: {listing.category}
            </p>

            <div className="mt-6 border-t pt-5">
              <h2 className="font-bold text-slate-900">
                Descripción
              </h2>
              <p className="mt-2 whitespace-pre-wrap text-slate-600">
                {listing.description}
              </p>
            </div>

            <div className="mt-6 border-t pt-5">
              <h2 className="font-bold text-slate-900">
                Ubicación
              </h2>
              <p className="mt-2 text-slate-600">
                {listing.location || "No especificada"}
              </p>
            </div>

            <div className="mt-6 rounded-xl bg-slate-50 p-4">
              <h2 className="font-bold text-slate-900">
                Publicado por
              </h2>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-2xl">
                  {avatars[listing.seller.avatar] || "👤"}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    {listing.seller.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    Miembro UniMarket
                  </p>
                </div>
              </div>
            </div>

            {listing.isOwner ? (
              <button
                onClick={() =>
                  router.push(`/publicar/editar/${listing.id}`)
                }
                className="mt-6 w-full rounded-xl bg-indigo-700 p-3 font-bold text-white hover:bg-indigo-800"
              >
                Editar publicación
              </button>
            ) : (
              <p className="mt-6 rounded-xl bg-indigo-50 p-4 text-center text-sm text-indigo-800">
                ¿Te interesa esta publicación? Próximamente podrás contactar directamente con el vendedor.
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default function PublicacionPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          Cargando publicación...
        </main>
      }
    >
      <PublicacionContenido />
    </Suspense>
  );
}