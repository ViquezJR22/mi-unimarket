import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

const allowedAvatars = [
  "avatar-1",
  "avatar-2",
  "avatar-3",
  "avatar-4",
  "avatar-5",
  "avatar-6",
];

const allowedGenders = ["MUJER", "HOMBRE", "NO_ESPECIFICAR"];

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";
    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";
    const password =
      typeof body.password === "string" ? body.password : "";

    const avatar =
      typeof body.avatar === "string" ? body.avatar : "avatar-1";

    const gender =
      typeof body.gender === "string" ? body.gender : "NO_ESPECIFICAR";

    if (name.length < 2 || name.length > 80) {
      return NextResponse.json(
        { error: "El nombre debe tener entre 2 y 80 caracteres." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Escribe un correo electrónico válido." },
        { status: 400 }
      );
    }

    if (password.length < 8 || password.length > 72) {
      return NextResponse.json(
        { error: "La contraseña debe tener entre 8 y 72 caracteres." },
        { status: 400 }
      );
    }

    if (!allowedAvatars.includes(avatar)) {
      return NextResponse.json(
        { error: "Selecciona un avatar válido." },
        { status: 400 }
      );
    }

    if (!allowedGenders.includes(gender)) {
      return NextResponse.json(
        { error: "Selecciona una opción de sexo válida." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese correo." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        avatar,
        gender,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        gender: true,
        createdAt: true,
      },
    });

    await createSession(user.id);

    return NextResponse.json(
      {
        message: "Cuenta creada correctamente.",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al registrar usuario:", error);

    return NextResponse.json(
      { error: "No se pudo crear la cuenta." },
      { status: 500 }
    );
  }
}