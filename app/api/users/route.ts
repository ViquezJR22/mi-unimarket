import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        isSuspended: false,
      },
      select: {
        id: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error al consultar usuarios:", error);

    return NextResponse.json(
      { error: "No se pudieron consultar los usuarios." },
      { status: 500 }
    );
  }
}