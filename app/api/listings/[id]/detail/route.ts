import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const session = await getSession();

    const listing = await prisma.listing.findFirst({
      where: {
        id,
        isActive: true,
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
            gender: true,
          },
        },
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Publicación no encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...listing,
      isOwner: session?.userId === listing.sellerId,
    });
  } catch (error) {
    console.error("Error al consultar publicación:", error);

    return NextResponse.json(
      { error: "No se pudo cargar la publicación." },
      { status: 500 }
    );
  }
}