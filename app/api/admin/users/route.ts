import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin";

export async function GET() {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json(
        { error: "No tienes permiso para realizar esta acción." },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isSuspended: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
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

export async function PATCH(request: Request) {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json(
        { error: "No tienes permiso para realizar esta acción." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, isSuspended } = body;

    if (
      typeof userId !== "string" ||
      !userId.trim() ||
      typeof isSuspended !== "boolean"
    ) {
      return NextResponse.json(
        { error: "Datos de usuario no válidos." },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "El usuario no existe." },
        { status: 404 }
      );
    }

    if (targetUser.role === "ADMIN") {
      return NextResponse.json(
        { error: "No se pueden suspender cuentas administrativas." },
        { status: 403 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isSuspended },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isSuspended: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el usuario." },
      { status: 500 }
    );
  }
}