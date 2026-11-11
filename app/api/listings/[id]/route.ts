import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: Context) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Debes iniciar sesión." },
        { status: 401 }
      );
    }

    const { id } = await params;

    const existing = await prisma.listing.findFirst({
      where: {
        id,
        sellerId: session.userId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Publicación no encontrada o no tienes permiso para editarla." },
        { status: 404 }
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

    const listing = await prisma.listing.update({
      where: { id },
      data: {
        title,
        description,
        category,
        type,
        price,
        location:
          typeof body.location === "string"
            ? body.location.trim()
            : null,
        imageUrls,
        imageUrl: imageUrls[0] ?? null,
      },
    });

    return NextResponse.json(listing);
  } catch (error) {
    console.error("Error al editar publicación:", error);

    return NextResponse.json(
      { error: "No se pudo editar la publicación." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: Context) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Debes iniciar sesión." },
        { status: 401 }
      );
    }

    const { id } = await params;

    const existing = await prisma.listing.findFirst({
      where: {
        id,
        sellerId: session.userId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Publicación no encontrada o no tienes permiso para eliminarla." },
        { status: 404 }
      );
    }

    await prisma.listing.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({
      message: "Publicación eliminada correctamente.",
    });
  } catch (error) {
    console.error("Error al eliminar publicación:", error);

    return NextResponse.json(
      { error: "No se pudo eliminar la publicación." },
      { status: 500 }
    );
  }
}