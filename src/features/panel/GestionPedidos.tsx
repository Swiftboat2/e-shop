"use client";

import { useState } from "react";
import { formatearPrecio } from "@/core/dominio/precio";
import { formatearFechaCorta } from "./formato";
import { usePedidosAdmin } from "./hooksAdmin";
import { actualizarEstadoPedido } from "./mutaciones";
import type { EstadoPedido } from "@/core/types";

const FILTROS: { valor: EstadoPedido | "todos"; etiqueta: string }[] = [
  { valor: "todos", etiqueta: "Todos" },
  { valor: "pendiente", etiqueta: "Pendientes" },
  { valor: "aceptado", etiqueta: "Aceptados" },
  { valor: "ignorado", etiqueta: "Ignorados" },
];

const BADGE: Record<EstadoPedido, string> = {
  pendiente: "bg-amber-100 text-amber-800",
  aceptado: "bg-emerald-100 text-emerald-800",
  ignorado: "bg-stone-100 text-stone-500",
};

export function GestionPedidos({ slug }: { slug: string }) {
  const { pedidos, cargando } = usePedidosAdmin(slug);
  const [filtro, setFiltro] = useState<EstadoPedido | "todos">("todos");

  const filtrados = pedidos.filter((pedido) => filtro === "todos" || pedido.estado === filtro);

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Pedidos</h1>

      <div className="flex gap-1 overflow-x-auto">
        {FILTROS.map(({ valor, etiqueta }) => (
          <button
            key={valor}
            type="button"
            onClick={() => setFiltro(valor)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium ${
              filtro === valor ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-200"
            }`}
          >
            {etiqueta}
          </button>
        ))}
      </div>

      {cargando ? (
        <p className="py-8 text-center text-stone-500">Cargando pedidos...</p>
      ) : filtrados.length === 0 ? (
        <p className="rounded-xl border border-dashed border-stone-300 bg-white px-4 py-8 text-center text-stone-500">
          {pedidos.length === 0
            ? "Todavía no llegaron pedidos. Cuando un cliente confirme uno desde tu tienda, aparece acá al instante."
            : "No hay pedidos con este estado."}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtrados.map((pedido) => (
            <li key={pedido.id} className="rounded-xl border border-stone-200 bg-white p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bold">{pedido.numeroCorto}</p>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${BADGE[pedido.estado]}`}>
                  {pedido.estado}
                </span>
                <p className="text-sm text-stone-500">{formatearFechaCorta(pedido.createdAt)}</p>
                <p className="ml-auto font-bold">${formatearPrecio(pedido.total)}</p>
              </div>

              <ul className="mt-2 text-sm text-stone-700">
                {pedido.items.map((item) => (
                  <li key={`${pedido.id}-${item.productoId}`}>
                    {formatearPrecio(item.cantidad)}x {item.nombre} — $
                    {formatearPrecio(item.subtotal)}
                  </li>
                ))}
              </ul>
              {pedido.descuentoAplicado > 0 && (
                <p className="mt-1 text-sm font-medium text-emerald-700">
                  Descuento aplicado: -${formatearPrecio(pedido.descuentoAplicado)}
                </p>
              )}

              <p className="mt-2 text-sm text-stone-600">
                {pedido.datosCliente.nombre} · {pedido.datosCliente.metodoPago}
                {pedido.datosCliente.direccion && ` · ${pedido.datosCliente.direccion}`}
              </p>
              {pedido.datosCliente.notas && (
                <p className="text-sm italic text-stone-500">&quot;{pedido.datosCliente.notas}&quot;</p>
              )}

              <div className="mt-3 flex gap-2">
                {pedido.estado === "pendiente" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => void actualizarEstadoPedido(slug, pedido.id, "aceptado")}
                      className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white"
                    >
                      Aceptar
                    </button>
                    <button
                      type="button"
                      onClick={() => void actualizarEstadoPedido(slug, pedido.id, "ignorado")}
                      className="rounded-lg border border-stone-300 px-4 py-1.5 text-sm font-semibold text-stone-600"
                    >
                      Ignorar
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => void actualizarEstadoPedido(slug, pedido.id, "pendiente")}
                    className="rounded-lg border border-stone-300 px-4 py-1.5 text-sm font-semibold text-stone-600"
                  >
                    Restablecer a pendiente
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
