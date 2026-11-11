import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin";

export default async function AdminPage() {
  const admin = await getAdminUser();

  if (!admin) {
    redirect("/ingresar");
  }

  const [users, listings, orders, debts] = await Promise.all([
    prisma.user.count(),
    prisma.listing.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.commissionDebt.count({
      where: { status: { in: ["PENDING", "OVERDUE"] } },
    }),
  ]);

  const stats = [
    { label: "Usuarios registrados", value: users },
    { label: "Publicaciones activas", value: listings },
    { label: "Transacciones", value: orders },
    { label: "Comisiones pendientes", value: debts },
  ];

  return (
    <main className="min-h-screen bg-gray-100 p-6 text-gray-900">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-purple-700">
              UNIMARKET
            </p>
            <h1 className="text-3xl font-bold">
              Panel de administración
            </h1>
            <p className="mt-2 text-gray-600">
              Bienvenido, {admin.name}
            </p>
          </div>

          <Link
            href="/"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium hover:bg-gray-50"
          >
            Ver marketplace
          </Link>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold">{stat.value}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Administración</h2>
          <p className="mt-2 text-gray-600">
            Aquí iremos incorporando las herramientas para controlar UniMarket.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Gestionar usuarios",
              "Moderar publicaciones",
              "Supervisar transacciones",
              "Revisar comisiones",
              "Atender disputas",
              "Consultar calificaciones",
            ].map((feature) => (
              <div
                key={feature}
                className="rounded-lg border border-gray-200 p-4"
              >
                <p className="font-semibold">{feature}</p>
                <p className="mt-1 text-sm text-gray-500">
                  Próximamente
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}