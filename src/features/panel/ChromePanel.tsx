"use client";

import { useState } from "react";
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

function NavLinks({ pathname, onNavegar }: { pathname: string; onNavegar?: () => void }) {
  return (
    <>
      {SECCIONES.map((seccion) => {
        const activa =
          seccion.href === "/admin" ? pathname === "/admin" : pathname.startsWith(seccion.href);
        return (
          <Link
            key={seccion.href}
            href={seccion.href}
            onClick={onNavegar}
            className={`rounded-(--admin-radio-md) px-3 py-2 text-sm font-medium transition-colors ${
              activa
                ? "bg-(--admin-acento) text-(--admin-acento-texto)"
                : "text-(--admin-texto-secundario) hover:bg-(--admin-acento-suave) hover:text-(--admin-texto)"
            }`}
          >
            {seccion.etiqueta}
          </Link>
        );
      })}
    </>
  );
}

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
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <div className="flex min-h-screen bg-(--admin-bg) text-(--admin-texto)">
      <aside className="hidden w-60 shrink-0 flex-col gap-1 border-r border-(--admin-borde) bg-(--admin-superficie) p-4 md:flex">
        <p className="mb-4 truncate px-1 text-base font-bold">{nombreComercio}</p>
        <nav className="flex flex-1 flex-col gap-1">
          <NavLinks pathname={pathname} />
        </nav>
        <div className="flex flex-col gap-1 border-t border-(--admin-borde) pt-3 text-sm">
          <Link
            href="/"
            className="rounded-(--admin-radio-md) px-3 py-2 font-medium text-(--admin-texto-secundario) hover:bg-(--admin-acento-suave) hover:text-(--admin-texto)"
          >
            Ver tienda
          </Link>
          <button
            type="button"
            onClick={() => signOut(auth)}
            className="rounded-(--admin-radio-md) px-3 py-2 text-left font-medium text-(--admin-texto-secundario) hover:bg-(--admin-acento-suave) hover:text-(--admin-texto)"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-(--admin-borde) bg-(--admin-superficie) px-4 md:hidden">
          <p className="truncate font-bold">{nombreComercio}</p>
          <button
            type="button"
            onClick={() => setMenuAbierto((abierto) => !abierto)}
            aria-expanded={menuAbierto}
            aria-label="Abrir menú"
            className="ml-auto flex size-9 items-center justify-center rounded-(--admin-radio-md) border border-(--admin-borde)"
          >
            ☰
          </button>
        </header>

        {menuAbierto && (
          <nav className="flex flex-col gap-1 border-b border-(--admin-borde) bg-(--admin-superficie) p-3 md:hidden">
            <NavLinks pathname={pathname} onNavegar={() => setMenuAbierto(false)} />
            <div className="mt-2 flex flex-col gap-1 border-t border-(--admin-borde) pt-2 text-sm">
              <Link
                href="/"
                className="rounded-(--admin-radio-md) px-3 py-2 font-medium text-(--admin-texto-secundario)"
              >
                Ver tienda
              </Link>
              <button
                type="button"
                onClick={() => signOut(auth)}
                className="rounded-(--admin-radio-md) px-3 py-2 text-left font-medium text-(--admin-texto-secundario)"
              >
                Cerrar sesión
              </button>
            </div>
          </nav>
        )}

        {!activo && (
          <div className="bg-amber-100 px-4 py-2 text-center text-sm font-medium text-amber-900">
            Tu tienda no está publicada: los clientes ven una pantalla de &quot;en
            construcción&quot;. Publicala desde Inicio.
          </div>
        )}

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
      </div>
    </div>
  );
}
