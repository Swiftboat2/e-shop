"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/core/firebase/client";

const SECCIONES = [
  { href: "/admin", etiqueta: "Inicio" },
  { href: "/admin/pedidos", etiqueta: "Pedidos" },
  { href: "/admin/productos", etiqueta: "Productos" },
  { href: "/admin/presupuestos", etiqueta: "Presupuestos" },
  { href: "/admin/configuracion", etiqueta: "Configuración" },
];

export function ChromePanel({
  nombreComercio,
  activo,
  children,
}: {
  nombreComercio: string;
  activo: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
          <p className="truncate font-bold">{nombreComercio}</p>
          <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-500">
            Panel
          </span>
          <div className="ml-auto flex items-center gap-4 text-sm">
            <Link href="/" className="font-medium text-stone-600 hover:text-stone-900">
              Ver tienda
            </Link>
            <button
              type="button"
              onClick={() => signOut(auth)}
              className="font-medium text-stone-600 hover:text-stone-900"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 pb-2">
          {SECCIONES.map((seccion) => {
            const activa =
              seccion.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(seccion.href);
            return (
              <Link
                key={seccion.href}
                href={seccion.href}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium ${
                  activa ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                {seccion.etiqueta}
              </Link>
            );
          })}
        </nav>
      </header>

      {!activo && (
        <div className="bg-amber-100 px-4 py-2 text-center text-sm font-medium text-amber-900">
          Tu tienda no está publicada: los clientes ven una pantalla de &quot;en
          construcción&quot;. Publicala desde Inicio.
        </div>
      )}

      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
