"use client";

import { useEffect, useRef, useState } from "react";
import type { Categoria } from "@/core/types";

/** Nav sticky de categorías con scroll-spy: el indicador de categoría activa
 * se desliza entre posiciones al scrollear, nunca salta. */
export function NavCategorias({ categorias }: { categorias: Categoria[] }) {
  const [activa, setActiva] = useState(categorias[0]?.id ?? "");
  const [indicador, setIndicador] = useState<{ left: number; width: number } | null>(null);
  const contenedorRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef(new Map<string, HTMLAnchorElement>());

  // Scroll-spy: la franja de rootMargin marca activa a la sección que pasa
  // por debajo del header + nav sticky.
  useEffect(() => {
    const secciones = categorias
      .map((categoria) => document.getElementById(`categoria-${categoria.id}`))
      .filter((seccion): seccion is HTMLElement => seccion !== null);
    if (secciones.length === 0) return;

    const observer = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) {
            setActiva(entrada.target.id.replace("categoria-", ""));
          }
        }
      },
      { rootMargin: "-120px 0px -65% 0px" },
    );
    for (const seccion of secciones) observer.observe(seccion);
    return () => observer.disconnect();
  }, [categorias]);

  // Mueve el indicador a la posición del chip activo y lo mantiene visible
  // dentro del carril scrolleable.
  useEffect(() => {
    const medir = () => {
      const link = linksRef.current.get(activa);
      if (!link) return;
      setIndicador({ left: link.offsetLeft, width: link.offsetWidth });
    };
    medir();

    const link = linksRef.current.get(activa);
    const contenedor = contenedorRef.current;
    if (link && contenedor) {
      const sinMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      contenedor.scrollTo({
        left: link.offsetLeft - (contenedor.clientWidth - link.offsetWidth) / 2,
        behavior: sinMotion ? "auto" : "smooth",
      });
    }

    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, [activa]);

  if (categorias.length === 0) return null;

  return (
    <nav className="sticky top-14 z-10 border-y border-(--color-borde) bg-(--color-fondo)/95 backdrop-blur">
      <div ref={contenedorRef} className="mx-auto max-w-5xl overflow-x-auto px-4">
        <div className="relative flex w-max gap-2 py-2">
          {indicador && (
            <span
              aria-hidden="true"
              className="absolute inset-y-2 left-0 rounded-full bg-(--color-primario) transition-[transform,width] duration-250 motion-reduce:transition-none"
              style={{ width: indicador.width, transform: `translateX(${indicador.left}px)` }}
            />
          )}
          {categorias.map((categoria) => {
            const esActiva = categoria.id === activa;
            return (
              <a
                key={categoria.id}
                href={`#categoria-${categoria.id}`}
                ref={(link) => {
                  if (link) linksRef.current.set(categoria.id, link);
                  else linksRef.current.delete(categoria.id);
                }}
                className={`relative whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  esActiva
                    ? `text-(--color-sobre-primario) ${indicador ? "" : "bg-(--color-primario)"}`
                    : "hover:text-(--color-primario)"
                }`}
              >
                {categoria.nombre}
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
