"use client";

import { useCarrito } from "./CarritoContext";

export function BotonCarritoHeader() {
  const { items, abrir } = useCarrito();

  return (
    <button
      type="button"
      onClick={abrir}
      className="ml-auto flex items-center gap-2 rounded-full bg-(--color-primario) px-4 py-1.5 text-sm font-semibold text-white transition-transform active:scale-95"
    >
      Carrito
      <span className="flex size-5 items-center justify-center rounded-full bg-white/25 text-xs">
        {items.length}
      </span>
    </button>
  );
}
