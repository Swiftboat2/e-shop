"use client";

import { useEffect, useRef, useState } from "react";
import { formatearPrecio } from "@/core/dominio/precio";
import { useCarrito } from "./CarritoContext";

export function CarritoFlotante() {
  const { items, abierto, abrir, resumenPara, metodosPago } = useCarrito();

  // Pulso spring al sumar productos: la clave re-monta el botón y dispara la
  // animación. Se compara la cantidad total (no la de líneas) para que
  // incrementar un producto ya agregado también confirme.
  const cantidadTotal = items.reduce((suma, item) => suma + item.cantidad, 0);
  const cantidadPrevia = useRef<number | null>(null);
  const [pulso, setPulso] = useState(0);

  useEffect(() => {
    const previa = cantidadPrevia.current;
    cantidadPrevia.current = cantidadTotal;
    // La primera pasada (carrito restaurado de localStorage) no anima.
    if (previa !== null && cantidadTotal > previa) setPulso((valor) => valor + 1);
  }, [cantidadTotal]);

  if (items.length === 0 || abierto) return null;

  // Vista previa con el primer método de pago activo (el default del checkout).
  const resumen = resumenPara(metodosPago[0]?.id ?? "");
  const etiqueta = items.length === 1 ? "1 producto" : `${items.length} productos`;

  return (
    <div className="fixed inset-x-4 bottom-4 z-30 mx-auto max-w-md">
      <button
        key={pulso}
        type="button"
        onClick={abrir}
        onAnimationEnd={() => setPulso(0)}
        className={`flex w-full items-center justify-between rounded-2xl bg-(--color-primario) px-5 py-3.5 font-semibold text-(--color-sobre-primario) shadow-lg ${
          pulso > 0 ? "motion-safe:animate-[carrito-pulso_0.45s_cubic-bezier(0.34,1.56,0.64,1)]" : ""
        }`}
      >
        <span>Ver carrito · {etiqueta}</span>
        <span className="tabular-nums">${formatearPrecio(resumen.total)}</span>
      </button>
    </div>
  );
}
