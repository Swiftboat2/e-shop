"use client";

import { useCarrito } from "./CarritoContext";

export function BotonCarritoHeader() {
  const { items, abrir } = useCarrito();

  return (
    <button
      type="button"
      onClick={abrir}
      className="ml-auto flex items-center gap-2 rounded-full bg-(--color-primario) px-4 py-1.5 text-sm font-semibold text-(--color-sobre-primario)"
    >
      Carrito
      <span className="flex size-5 items-center justify-center rounded-full bg-(--color-sobre-primario)/25 text-xs tabular-nums">
        {items.length}
      </span>
    </button>
  );
}
