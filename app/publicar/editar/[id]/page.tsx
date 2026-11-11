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
  imageUrls: string[];
  imageUrl: string | null;
};

function EditarPublicacionContenido() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [listing, setListing] = useState<Listing | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState<"PRODUCT" | "SERVICE">("PRODUCT");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadListing() {
      try {
        const response = await fetch("/api/listings/mine", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("No se pudieron cargar tus anuncios.");
        }

        const listings: Listing[] = await response.json();
        const current = listings.find((item) => item.id === id);

        if (!current) {
          setError("Publicación no encontrada o no tienes permiso para editarla.");
          return;
        }

        setListing(current);
        setTitle(current.title);
        setDescription(current.description);
        setCategory(current.category);
        setType(current.type);
        setPrice(String(current.price));
        setLocation(current.location || "");
        setImageUrls(
          current.imageUrls?.length
            ? current.imageUrls
            : current.imageUrl
              ? [current.imageUrl]
              : []
        );
      } catch {
        setError("No se pudo cargar la publicación.");
      } finally {
        setLoading(false);
      }
    }

    if (id) loadListing();
  }, [id]);

  function handleImages(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files || []);

    if (imageUrls.length + images.length + selected.length > 5) {
      setError("Puedes tener un máximo de 5 fotografías.");
      event.target.value = "";
      return;
    }

    const invalid = selected.some(
      (file) =>
        !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        file.size > 5 * 1024 * 1024
    );

    if (invalid) {
      setError("Usa imágenes JPG, PNG o WEBP de máximo 5 MB.");
      event.target.value = "";
      return;
    }

    setError("");
    setImages((previous) => [...previous, ...selected]);
    event.target.value = "";
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      let finalImageUrls = [...imageUrls];

      if (images.length > 0) {
        const formData = new FormData();

        images.forEach((image) => {
          formData.append("images", image);
        });

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(
            uploadData.error || "No se pudieron subir las fotografías."
          );
        }

        finalImageUrls = [...finalImageUrls, ...uploadData.imageUrls];
      }

      const response = await fetch(`/api/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          type,
          price: Number(price),
          location,
          imageUrls: finalImageUrls,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "No se pudo actualizar la publicación."
        );
      }

      alert("¡Publicación actualizada correctamente!");
      router.push("/cuenta");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al guardar."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main className="p-10 text-center">Cargando publicación...</main>;
  }

  if (!listing) {
    return (
      <main className="mx-auto max-w-xl p-8 text-center">
        <p className="text-red-600">
          {error || "Publicación no encontrada."}
        </p>
        <button
          onClick={() => router.push("/cuenta")}
          className="mt-5 rounded-xl bg-indigo-700 px-5 py-3 text-white"
        >
          Volver a mi perfil
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <button
          type="button"
          onClick={() => router.push("/cuenta")}
          className="font-semibold text-indigo-700"
        >
          ← Volver a mi perfil
        </button>

        <h1 className="mt-6 text-2xl font-black text-slate-900">
          Editar publicación
        </h1>

        <form onSubmit={handleSave} className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block font-semibold">
              ¿Qué deseas publicar?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType("PRODUCT")}
                className={`rounded-xl border p-3 font-semibold ${
                  type === "PRODUCT"
                    ? "border-indigo-700 bg-indigo-50 text-indigo-700"
                    : "border-slate-300"
                }`}
              >
                Producto
              </button>
              <button
                type="button"
                onClick={() => setType("SERVICE")}
                className={`rounded-xl border p-3 font-semibold ${
                  type === "SERVICE"
                    ? "border-indigo-700 bg-indigo-50 text-indigo-700"
                    : "border-slate-300"
                }`}
              >
                Servicio
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block font-semibold">Título</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              className="w-full rounded-xl border border-slate-300 p-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold">Categoría</label>
            <input
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold">Precio en colones</label>
            <input
              required
              type="number"
              min="0"
              step="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold">Descripción</label>
            <textarea
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold">Ubicación</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold">
              Fotografías (máximo 5)
            </label>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {imageUrls.map((url, index) => (
                <div key={url} className="relative">
                  <img
                    src={url}
                    alt={`Fotografía ${index + 1}`}
                    className="h-28 w-full rounded-xl object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setImageUrls((previous) =>
                        previous.filter((_, i) => i !== index)
                      )
                    }
                    className="absolute right-1 top-1 rounded-full bg-red-600 px-2 py-1 text-white"
                  >
                    X
                  </button>
                </div>
              ))}

              {images.map((image, index) => (
                <div key={`${image.name}-${index}`} className="relative">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={image.name}
                    className="h-28 w-full rounded-xl object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setImages((previous) =>
                        previous.filter((_, i) => i !== index)
                      )
                    }
                    className="absolute right-1 top-1 rounded-full bg-red-600 px-2 py-1 text-white"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>

            {imageUrls.length + images.length < 5 && (
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleImages}
                className="mt-3 w-full rounded-xl border border-slate-300 p-3"
              />
            )}

            <p className="mt-2 text-sm text-slate-500">
              Puedes conservar, quitar o agregar fotografías.
            </p>
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-indigo-700 p-3 font-semibold text-white hover:bg-indigo-800 disabled:opacity-50"
          >
            {saving ? "Guardando cambios..." : "Guardar cambios"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function EditarPublicacionPage() {
  return (
    <Suspense
      fallback={
        <main className="p-10 text-center">
          Preparando editor de publicación...
        </main>
      }
    >
      <EditarPublicacionContenido />
    </Suspense>
  );
}