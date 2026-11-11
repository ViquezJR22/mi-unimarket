import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth";

export async function POST() {
  try {
    await deleteSession();

    return NextResponse.json({
      message: "Sesión cerrada correctamente.",
    });
  } catch (error) {
    console.error("Error al cerrar sesión:", error);

    return NextResponse.json(
      { error: "No se pudo cerrar la sesión." },
      { status: 500 }
    );
  }
}