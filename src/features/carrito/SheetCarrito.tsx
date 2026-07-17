"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { formatearPrecio } from "@/core/dominio/precio";
import { crearPedido } from "@/features/pedidos/acciones";
import { useCarrito } from "./CarritoContext";

/** Cantidad con slide vertical tipo odómetro al cambiar: con venta
 * fraccionada (0,25kg → 0,5kg) el movimiento hace legible qué cambió. */
function ContadorCantidad({ cantidad, unidad }: { cantidad: number; unidad?: string }) {
  // Patrón de "estado del render anterior": la dirección del slide sale de
  // comparar contra la cantidad previa, ajustada durante el render.
  const [previa, setPrevia] = useState(cantidad);
  const [sube, setSube] = useState(true);
  if (cantidad !== previa) {
    setSube(cantidad > previa);
    setPrevia(cantidad);
  }

  return (
    <span className="inline-flex min-w-12 justify-center overflow-hidden text-center text-sm font-semibold tabular-nums">
      <span
        key={cantidad}
        className={
          sube
            ? "motion-safe:animate-[odometro-sube_0.18s_ease-out]"
            : "motion-safe:animate-[odometro-baja_0.18s_ease-out]"
        }
      >
        {formatearPrecio(cantidad)}
        {unidad ? ` ${unidad}` : ""}
      </span>
    </span>
  );
}

export function SheetCarrito() {
  const { items, abierto, cerrar, incrementar, quitar, vaciar, resumenPara, metodosPago, slug } =
    useCarrito();

  const [nombre, setNombre] = useState("");
  const [metodoPago, setMetodoPago] = useState(metodosPago[0]?.id ?? "");
  const [direccion, setDireccion] = useState("");
  const [notas, setNotas] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, comenzarEnvio] = useTransition();

  const resumen = resumenPara(metodoPago);

  // Destello del total al cruzar un umbral de descuento por volumen: el
  // cambio de precio se confirma con color, sin interrumpir.
  const [destello, setDestello] = useState(0);
  const descuentoPrevio = useRef<number | null>(null);
  useEffect(() => {
    const previo = descuentoPrevio.current;
    descuentoPrevio.current = resumen.descuentoPorcentaje;
    if (previo !== null && resumen.descuentoPorcentaje !== previo) {
      setDestello((valor) => valor + 1);
    }
  }, [resumen.descuentoPorcentaje]);

  // Cierra con Escape y bloquea el scroll del fondo mientras está abierto.
  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (evento: KeyboardEvent) => evento.key === "Escape" && cerrar();
    document.addEventListener("keydown", alTeclear);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", alTeclear);
      document.body.style.overflow = "";
    };
  }, [abierto, cerrar]);

  if (!abierto) return null;

  const enviar = (evento: React.FormEvent) => {
    evento.preventDefault();
    setError(null);
    comenzarEnvio(async () => {
      try {
        const resultado = await crearPedido({
          slug,
          items: items.map((item) => ({ productoId: item.productoId, cantidad: item.cantidad })),
          cliente: {
            nombre,
            metodoPago,
            direccion: direccion.trim() || undefined,
            notas: notas.trim() || undefined,
          },
        });

        if (!resultado.ok) {
          setError(resultado.error);
          return;
        }

        vaciar();
        cerrar();
        window.location.href = resultado.url;
      } catch {
        setError(
          "No pudimos enviar el pedido, parece un problema de conexión. Tu carrito queda guardado: revisá tu señal y probá de nuevo.",
        );
      }
    });
  };

  return (
    <div className="fixed inset-0 z-40">
      <button
        type="button"
        aria-label="Cerrar carrito"
        onClick={cerrar}
        className="absolute inset-0 bg-black/40 motion-safe:animate-[aparece_0.2s_ease-out]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Tu pedido"
        className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[88dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-(--color-fondo) text-(--color-texto) shadow-2xl motion-safe:animate-[sheet-sube_0.28s_ease-out]"
      >
        <div className="flex items-center justify-between border-b border-(--color-borde) px-5 py-4">
          <h2 className="font-[family-name:var(--fuente-display)] text-lg font-bold">Tu pedido</h2>
          <button
            type="button"
            onClick={cerrar}
            aria-label="Cerrar"
            className="flex size-8 items-center justify-center rounded-full bg-(--color-texto)/8 text-lg"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="py-8 text-center opacity-60">
              Tu carrito está vacío. Tocá el + de cualquier producto y armá tu pedido acá.
            </p>
          ) : (
            <>
              <ul className="flex flex-col gap-3">
                {items.map((item) => (
                  <li key={item.productoId} className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{item.nombre}</p>
                      <p className="text-xs tabular-nums opacity-60">
                        ${formatearPrecio(item.precio)}
                        {item.unidadMedida ? ` /${item.unidadMedida}` : " c/u"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => quitar(item.productoId)}
                        aria-label={`Quitar ${item.nombre}`}
                        className="flex size-7 items-center justify-center rounded-full border border-(--color-borde) font-bold"
                      >
                        −
                      </button>
                      <ContadorCantidad cantidad={item.cantidad} unidad={item.unidadMedida} />
                      <button
                        type="button"
                        onClick={() => incrementar(item.productoId)}
                        aria-label={`Agregar más ${item.nombre}`}
                        className="flex size-7 items-center justify-center rounded-full bg-(--color-primario) font-bold text-(--color-sobre-primario)"
                      >
                        +
                      </button>
                    </div>
                    <p className="w-20 text-right text-sm font-bold tabular-nums">
                      ${formatearPrecio(item.precio * item.cantidad)}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex flex-col gap-1 border-t border-(--color-borde) pt-4 text-sm">
                {resumen.descuentoPorcentaje > 0 && (
                  <>
                    <div className="flex justify-between tabular-nums">
                      <span>Subtotal</span>
                      <span>${formatearPrecio(resumen.subtotal)}</span>
                    </div>
                    <div className="flex justify-between font-medium tabular-nums text-(--color-primario)">
                      <span>Descuento por volumen ({resumen.descuentoPorcentaje}%)</span>
                      <span>-${formatearPrecio(resumen.descuentoMonto)}</span>
                    </div>
                  </>
                )}
                <div
                  key={destello}
                  className={`flex justify-between rounded-md text-base font-bold tabular-nums ${
                    destello > 0 ? "motion-safe:animate-[destello-descuento_0.6s_ease-out]" : ""
                  }`}
                >
                  <span>Total</span>
                  <span>${formatearPrecio(resumen.total)}</span>
                </div>
              </div>

              <form onSubmit={enviar} className="mt-5 flex flex-col gap-3">
                <label className="flex flex-col gap-1 text-sm font-medium">
                  Tu nombre
                  <input
                    required
                    value={nombre}
                    onChange={(evento) => setNombre(evento.target.value)}
                    placeholder="¿Quién hace el pedido?"
                    className="rounded-lg border border-(--color-borde) bg-(--color-superficie) px-3 py-2 text-base placeholder:text-(--color-texto)/45"
                  />
                </label>

                <fieldset className="text-sm font-medium">
                  <legend className="mb-2">Método de pago</legend>
                  <div className="flex flex-wrap gap-2">
                    {metodosPago.map((metodo) => (
                      <label
                        key={metodo.id}
                        className={`cursor-pointer rounded-full border px-4 py-1.5 ${
                          metodoPago === metodo.id
                            ? "border-(--color-primario) bg-(--color-primario)/10 text-(--color-primario)"
                            : "border-(--color-borde)"
                        }`}
                      >
                        <input
                          type="radio"
                          name="metodoPago"
                          value={metodo.id}
                          checked={metodoPago === metodo.id}
                          onChange={() => setMetodoPago(metodo.id)}
                          className="sr-only"
                        />
                        {metodo.nombre}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <label className="flex flex-col gap-1 text-sm font-medium">
                  Dirección de envío (opcional)
                  <input
                    value={direccion}
                    onChange={(evento) => setDireccion(evento.target.value)}
                    placeholder="Calle, número, referencia"
                    className="rounded-lg border border-(--color-borde) bg-(--color-superficie) px-3 py-2 text-base placeholder:text-(--color-texto)/45"
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm font-medium">
                  Notas (opcional)
                  <textarea
                    value={notas}
                    onChange={(evento) => setNotas(evento.target.value)}
                    rows={2}
                    placeholder="Aclaraciones para el comercio"
                    className="rounded-lg border border-(--color-borde) bg-(--color-superficie) px-3 py-2 text-base placeholder:text-(--color-texto)/45"
                  />
                </label>

                {error && (
                  <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={enviando}
                  className="mt-1 rounded-lg bg-(--color-primario) px-5 py-3.5 font-bold text-(--color-sobre-primario) disabled:opacity-60"
                >
                  {enviando ? "Enviando..." : "Enviar pedido por WhatsApp"}
                </button>
                <p className="pb-2 text-center text-xs opacity-50">
                  Se abre WhatsApp con el pedido listo para mandar.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
