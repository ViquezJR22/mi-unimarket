import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const listings = await prisma.listing.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(listings);
  } catch (error) {
    console.error("Error al consultar publicaciones:", error);

    return NextResponse.json(
      { error: "No se pudieron cargar las publicaciones" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para publicar." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, isSuspended: true },
    });

    if (!user || user.isSuspended) {
      return NextResponse.json(
        { error: "Tu cuenta no puede publicar anuncios." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const title =
      typeof body.title === "string" ? body.title.trim() : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    const category =
      typeof body.category === "string" ? body.category.trim() : "";

    const type = body.type;
    const price = body.price;

    const imageUrls = Array.isArray(body.imageUrls)
      ? body.imageUrls
      : [];

    if (
      !title ||
      !description ||
      !category ||
      !["PRODUCT", "SERVICE"].includes(type) ||
      !Number.isSafeInteger(price) ||
      price < 0
    ) {
      return NextResponse.json(
        { error: "Revisa los datos de la publicación." },
        { status: 400 }
      );
    }

    if (
      imageUrls.length > 5 ||
      imageUrls.some((url: unknown) => {
        if (typeof url !== "string") return true;

        try {
          const parsed = new URL(url);

          return (
            parsed.protocol !== "https:" ||
            parsed.hostname !== "res.cloudinary.com"
          );
        } catch {
          return true;
        }
      })
    ) {
      return NextResponse.json(
        { error: "Las fotografías no son válidas." },
        { status: 400 }
      );
    }

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        category,
        type,
        price,
        sellerId: user.id,
        location:
          typeof body.location === "string"
            ? body.location.trim()
            : null,
        imageUrls,
        imageUrl: imageUrls[0] ?? null,
      },
    });

    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    console.error("Error al crear publicación:", error);

    return NextResponse.json(
      { error: "No se pudo crear la publicación." },
      { status: 500 }
    );
  }
}