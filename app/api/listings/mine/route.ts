import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Debes iniciar sesión." },
        { status: 401 }
      );
    }

    const listings = await prisma.listing.findMany({
      where: {
        sellerId: session.userId,
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(listings);
  } catch (error) {
    console.error("Error al consultar mis publicaciones:", error);

    return NextResponse.json(
      { error: "No se pudieron cargar tus publicaciones." },
      { status: 500 }
    );
  }
}