"use client";

import { formatearPrecio } from "@/core/dominio/precio";
import { useCarrito } from "./CarritoContext";

export function CarritoFlotante() {
  const { items, abierto, abrir, resumenPara, metodosPago } = useCarrito();
  if (items.length === 0 || abierto) return null;

  // Vista previa con el primer método de pago activo (el default del checkout).
  const resumen = resumenPara(metodosPago[0]?.id ?? "");
  const etiqueta = items.length === 1 ? "1 producto" : `${items.length} productos`;

  return (
    <div className="fixed inset-x-4 bottom-4 z-30 mx-auto max-w-md">
      <button
        type="button"
        onClick={abrir}
        className="flex w-full items-center justify-between rounded-2xl bg-(--color-primario) px-5 py-3.5 font-semibold text-white shadow-lg"
      >
        <span>Ver carrito · {etiqueta}</span>
        <span>${formatearPrecio(resumen.total)}</span>
      </button>
    </div>
  );
}
