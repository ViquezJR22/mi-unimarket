import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const allowedAvatars = [
  "avatar-1",
  "avatar-2",
  "avatar-3",
  "avatar-4",
  "avatar-5",
  "avatar-6",
];

const allowedGenders = ["MUJER", "HOMBRE", "NO_ESPECIFICAR"];

export async function PATCH(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Debes iniciar sesión." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";
    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";
    const avatar =
      typeof body.avatar === "string" ? body.avatar : "";

    const gender =
      typeof body.gender === "string" ? body.gender : undefined;

    if (name.length < 2 || name.length > 80) {
      return NextResponse.json(
        { error: "El nombre debe tener entre 2 y 80 caracteres." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Escribe un correo válido." },
        { status: 400 }
      );
    }

    if (!allowedAvatars.includes(avatar)) {
      return NextResponse.json(
        { error: "Selecciona un avatar válido." },
        { status: 400 }
      );
    }

    if (gender !== undefined && !allowedGenders.includes(gender)) {
      return NextResponse.json(
        { error: "Selecciona una opción de sexo válida." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id: session.userId },
      },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Ese correo ya pertenece a otra cuenta." },
        { status: 409 }
      );
    }

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: {
        name,
        email,
        avatar,
        ...(gender !== undefined ? { gender } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        gender: true,
      },
    });

    return NextResponse.json({
      message: "Perfil actualizado correctamente.",
      user,
    });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);

    return NextResponse.json(
      { error: "No se pudo actualizar el perfil." },
      { status: 500 }
    );
  }
}