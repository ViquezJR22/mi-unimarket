import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const prisma = new PrismaClient();

async function main() {
  const terminal = createInterface({ input: stdin, output: stdout });

  try {
    const name = (await terminal.question("Tu nombre: ")).trim();
    const email = (
      await terminal.question("Tu correo administrativo: ")
    ).trim().toLowerCase();
    const password = await terminal.question(
      "Crea una contraseña segura: "
    );

    if (name.length < 2 || name.length > 80) {
      throw new Error("El nombre debe tener entre 2 y 80 caracteres.");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("El correo no es válido.");
    }

    if (password.length < 8 || password.length > 72) {
      throw new Error("La contraseña debe tener entre 8 y 72 caracteres.");
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error(
        "Ese correo ya está registrado. No se modificó ninguna cuenta."
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "ADMIN",
      },
      select: {
        name: true,
        email: true,
        role: true,
      },
    });

    console.log("\nCuenta administrativa creada correctamente.");
    console.log("Nombre:", admin.name);
    console.log("Correo:", admin.email);
    console.log("Rol:", admin.role);
  } finally {
    terminal.close();
  }
}

main()
  .catch((error) => {
    console.error("No se pudo crear el administrador:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });