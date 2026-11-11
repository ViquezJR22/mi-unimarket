import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";

export async function GET() {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json(
        { error: "Acceso exclusivo para administradores." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      authorized: true,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Error al verificar administrador:", error);

    return NextResponse.json(
      { error: "No se pudo verificar el acceso." },
      { status: 500 }
    );
  }
}