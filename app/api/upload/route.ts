import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getSession } from "@/lib/auth";


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_FILES = 5;
const MAX_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function uploadImage(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "unimarket/listings",
          resource_type: "image",
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error("Error al subir la imagen"));
            return;
          }

          resolve(result.secure_url);
        }
      )
      .end(buffer);
  });
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para subir imágenes." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll("images");

    if (files.length === 0 || files.length > MAX_FILES) {
      return NextResponse.json(
        { error: "Puedes subir entre 1 y 5 fotografías." },
        { status: 400 }
      );
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (typeof file === "string") {
        return NextResponse.json(
          { error: "Archivo no válido." },
          { status: 400 }
        );
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: "Solo se permiten imágenes JPG, PNG o WEBP." },
          { status: 400 }
        );
      }

      if (file.size === 0 || file.size > MAX_SIZE) {
        return NextResponse.json(
          { error: "Cada fotografía debe pesar máximo 5 MB." },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const url = await uploadImage(buffer);

      uploadedUrls.push(url);
    }

    return NextResponse.json({ imageUrls: uploadedUrls });
  } catch (error) {
    console.error("Error al subir imágenes:", error);

    return NextResponse.json(
      { error: "No se pudieron subir las fotografías." },
      { status: 500 }
    );
  }
}