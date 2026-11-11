"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PublicarPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("PRODUCT");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function handleImages(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files || []);
    setError("");

    if (selected.length > 5) {
      setError("Puedes seleccionar máximo 5 fotografías.");
      event.target.value = "";
      return;
    }

    const valid = selected.every(
      (file) =>
        ["image/jpeg", "image/png", "image/webp"].includes(file.type) &&
        file.size <= 5 * 1024 * 1024
    );

    if (!valid) {
      setError("Usa imágenes JPG, PNG o WEBP de máximo 5 MB cada una.");
      event.target.value = "";
      return;
    }

    setImages(selected);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const amount = Number(price);

    if (!Number.isSafeInteger(amount) || amount < 0) {
      setError("Escribe un precio válido en colones.");
      return;
    }

    setSaving(true);

    try {
      let imageUrls: string[] = [];

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

        imageUrls = uploadData.imageUrls;
      }

      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          type,
          category,
          price: amount,
          location,
          imageUrls,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo publicar el anuncio.");
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al publicar."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-900">
      <div className="mx-auto max-w-2xl">
        <a href="/" className="font-bold text-indigo-700">
          ← Volver a UniMarket
        </a>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-3xl font-black">Publicar un anuncio</h1>
          <p className="mt-2 text-slate-500">
            Comparte un producto o servicio con tu comunidad.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block font-semibold">
                ¿Qué deseas publicar?
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType("PRODUCT")}
                  className={`rounded-xl border p-4 font-semibold ${
                    type === "PRODUCT"
                      ? "border-indigo-700 bg-indigo-50 text-indigo-700"
                      : "border-slate-200"
                  }`}
                >
                  📦 Producto
                </button>

                <button
                  type="button"
                  onClick={() => setType("SERVICE")}
                  className={`rounded-xl border p-4 font-semibold ${
                    type === "SERVICE"
                      ? "border-indigo-700 bg-indigo-50 text-indigo-700"
                      : "border-slate-200"
                  }`}
                >
                  🧑‍💻 Servicio
                </button>
              </div>
            </div>

<div>
              <label htmlFor="images" className="mb-2 block font-semibold">
                Fotografías (máximo 5)
              </label>

              <input
                id="images"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleImages}
                className="w-full rounded-xl border border-slate-300 p-3"
              />

              <p className="mt-2 text-sm text-slate-500">
                JPG, PNG o WEBP. Máximo 5 MB por fotografía.
              </p>

              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {images.map((image, index) => (
                    <div key={`${image.name}-${index}`} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Fotografía ${index + 1}`}
                        className="h-32 w-full rounded-xl border object-cover"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setImages((previous) =>
                            previous.filter((_, i) => i !== index)
                          )
                        }
                        className="absolute right-2 top-2 rounded-full bg-red-600 px-2 py-1 text-sm font-bold text-white"
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>


            <div>
              <label htmlFor="title" className="mb-2 block font-semibold">
                Título
              </label>
              <input
                id="title"
                required
                maxLength={100}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Laptop en buen estado"
                className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label htmlFor="category" className="mb-2 block font-semibold">
                Categoría
              </label>
              <input
                id="category"
                required
                maxLength={60}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ej. Tecnología, Educación, Hogar..."
                className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label htmlFor="description" className="mb-2 block font-semibold">
                Descripción
              </label>
              <textarea
                id="description"
                required
                maxLength={3000}
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe lo que ofreces..."
                className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label htmlFor="price" className="mb-2 block font-semibold">
                Precio en colones (₡)
              </label>
              <input
                id="price"
                type="number"
                required
                min="0"
                step="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="5000"
                className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label htmlFor="location" className="mb-2 block font-semibold">
                Ubicación (opcional)
              </label>
              <input
                id="location"
                maxLength={100}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ej. Heredia, Costa Rica"
                className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-indigo-600"
              />
            </div>


            {error && (
              <p role="alert" className="rounded-xl bg-red-50 p-3 text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-indigo-700 px-5 py-4 font-bold text-white hover:bg-indigo-800 disabled:opacity-60"
            >
              {saving ? "Subiendo y publicando..." : "Publicar anuncio"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}