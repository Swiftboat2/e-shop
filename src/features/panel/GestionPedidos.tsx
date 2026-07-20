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
  ignorado: "bg-(--admin-acento-suave) text-(--admin-texto-secundario)",
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
              filtro === valor
                ? "bg-(--admin-acento) text-(--admin-acento-texto)"
                : "text-(--admin-texto-secundario) hover:bg-(--admin-acento-suave)"
            }`}
          >
            {etiqueta}
          </button>
        ))}
      </div>

      {cargando ? (
        <p className="py-8 text-center text-(--admin-texto-secundario)">Cargando pedidos...</p>
      ) : filtrados.length === 0 ? (
        <p className="rounded-(--admin-radio-lg) border border-dashed border-(--admin-borde) bg-(--admin-superficie) px-4 py-8 text-center text-(--admin-texto-secundario)">
          {pedidos.length === 0
            ? "Todavía no llegaron pedidos. Cuando un cliente confirme uno desde tu tienda, aparece acá al instante."
            : "No hay pedidos con este estado."}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtrados.map((pedido) => (
            <li
              key={pedido.id}
              className="rounded-(--admin-radio-lg) border border-(--admin-borde) bg-(--admin-superficie) p-4 shadow-(--admin-sombra-sm)"
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bold">{pedido.numeroCorto}</p>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${BADGE[pedido.estado]}`}>
                  {pedido.estado}
                </span>
                <p className="text-sm text-(--admin-texto-secundario)">{formatearFechaCorta(pedido.createdAt)}</p>
                <p className="ml-auto font-bold">${formatearPrecio(pedido.total)}</p>
              </div>

              <ul className="mt-2 text-sm text-(--admin-texto)">
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

              <p className="mt-2 text-sm text-(--admin-texto-secundario)">
                {pedido.datosCliente.nombre} · {pedido.datosCliente.metodoPago}
                {pedido.datosCliente.direccion && ` · ${pedido.datosCliente.direccion}`}
              </p>
              {pedido.datosCliente.notas && (
                <p className="text-sm italic text-(--admin-texto-secundario)">&quot;{pedido.datosCliente.notas}&quot;</p>
              )}

              <div className="mt-3 flex gap-2">
                {pedido.estado === "pendiente" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => void actualizarEstadoPedido(slug, pedido.id, "aceptado")}
                      className="rounded-(--admin-radio-md) bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white"
                    >
                      Aceptar
                    </button>
                    <button
                      type="button"
                      onClick={() => void actualizarEstadoPedido(slug, pedido.id, "ignorado")}
                      className="rounded-(--admin-radio-md) border border-(--admin-borde) px-4 py-1.5 text-sm font-semibold text-(--admin-texto-secundario)"
                    >
                      Ignorar
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => void actualizarEstadoPedido(slug, pedido.id, "pendiente")}
                    className="rounded-(--admin-radio-md) border border-(--admin-borde) px-4 py-1.5 text-sm font-semibold text-(--admin-texto-secundario)"
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
