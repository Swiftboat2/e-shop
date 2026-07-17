"use client";

import { useCarrito } from "./CarritoContext";
import type { Producto } from "@/core/types";

export function BotonAgregar({ producto }: { producto: Producto }) {
  const { agregar } = useCarrito();

  return (
    <button
      type="button"
      onClick={() => agregar(producto)}
      aria-label={`Agregar ${producto.nombre} al carrito`}
      className="flex size-8 items-center justify-center rounded-full bg-(--color-primario) text-lg font-bold text-(--color-sobre-primario) transition-transform motion-safe:active:scale-90"
    >
      +
    </button>
  );
}
