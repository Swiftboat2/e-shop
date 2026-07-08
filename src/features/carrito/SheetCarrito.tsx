"use client";

import { useEffect, useState, useTransition } from "react";
import { formatearPrecio } from "@/core/dominio/precio";
import { crearPedido } from "@/features/pedidos/acciones";
import { useCarrito } from "./CarritoContext";

export function SheetCarrito() {
  const { items, abierto, cerrar, incrementar, quitar, vaciar, resumenPara, metodosPago, slug } =
    useCarrito();

  const [nombre, setNombre] = useState("");
  const [metodoPago, setMetodoPago] = useState(metodosPago[0]?.id ?? "");
  const [direccion, setDireccion] = useState("");
  const [notas, setNotas] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, comenzarEnvio] = useTransition();

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

  const resumen = resumenPara(metodoPago);

  const enviar = (evento: React.FormEvent) => {
    evento.preventDefault();
    setError(null);
    comenzarEnvio(async () => {
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
    });
  };

  return (
    <div className="fixed inset-0 z-40">
      <button
        type="button"
        aria-label="Cerrar carrito"
        onClick={cerrar}
        className="absolute inset-0 bg-black/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Tu pedido"
        className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[88dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-(--color-fondo) text-(--color-texto) shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
          <h2 className="text-lg font-bold">Tu pedido</h2>
          <button
            type="button"
            onClick={cerrar}
            aria-label="Cerrar"
            className="flex size-8 items-center justify-center rounded-full bg-black/5 text-lg"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="py-8 text-center opacity-60">Tu carrito está vacío.</p>
          ) : (
            <>
              <ul className="flex flex-col gap-3">
                {items.map((item) => (
                  <li key={item.productoId} className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{item.nombre}</p>
                      <p className="text-xs opacity-60">
                        ${formatearPrecio(item.precio)}
                        {item.unidadMedida ? ` /${item.unidadMedida}` : " c/u"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => quitar(item.productoId)}
                        aria-label={`Quitar ${item.nombre}`}
                        className="flex size-7 items-center justify-center rounded-full border border-black/15 font-bold"
                      >
                        −
                      </button>
                      <span className="min-w-12 text-center text-sm font-semibold">
                        {formatearPrecio(item.cantidad)}
                        {item.unidadMedida ? ` ${item.unidadMedida}` : ""}
                      </span>
                      <button
                        type="button"
                        onClick={() => incrementar(item.productoId)}
                        aria-label={`Agregar más ${item.nombre}`}
                        className="flex size-7 items-center justify-center rounded-full border border-black/15 font-bold"
                      >
                        +
                      </button>
                    </div>
                    <p className="w-20 text-right text-sm font-bold">
                      ${formatearPrecio(item.precio * item.cantidad)}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex flex-col gap-1 border-t border-black/10 pt-4 text-sm">
                {resumen.descuentoPorcentaje > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${formatearPrecio(resumen.subtotal)}</span>
                    </div>
                    <div className="flex justify-between font-medium text-(--color-primario)">
                      <span>Descuento por volumen ({resumen.descuentoPorcentaje}%)</span>
                      <span>-${formatearPrecio(resumen.descuentoMonto)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-base font-bold">
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
                    className="rounded-lg border border-black/15 bg-white px-3 py-2 text-base"
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
                            : "border-black/15"
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
                    className="rounded-lg border border-black/15 bg-white px-3 py-2 text-base"
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm font-medium">
                  Notas (opcional)
                  <textarea
                    value={notas}
                    onChange={(evento) => setNotas(evento.target.value)}
                    rows={2}
                    placeholder="Aclaraciones para el comercio"
                    className="rounded-lg border border-black/15 bg-white px-3 py-2 text-base"
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
                  className="mt-1 rounded-xl bg-(--color-primario) px-5 py-3.5 font-bold text-white disabled:opacity-60"
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
