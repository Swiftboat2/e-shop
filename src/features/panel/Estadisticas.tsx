"use client";

import { useState } from "react";
import { calcularEstadisticas, type Periodo } from "@/core/dominio/estadisticas";
import { formatearPrecio } from "@/core/dominio/precio";
import { usePedidosAdmin } from "./hooksAdmin";

const PERIODOS: { valor: Periodo; etiqueta: string }[] = [
  { valor: "hoy", etiqueta: "Hoy" },
  { valor: "mes", etiqueta: "Este mes" },
  { valor: "todo", etiqueta: "Todo" },
];

export function Estadisticas({ slug, timezone }: { slug: string; timezone: string }) {
  const { pedidos, cargando } = usePedidosAdmin(slug);
  const [periodo, setPeriodo] = useState<Periodo>("mes");

  const estadisticas = calcularEstadisticas(pedidos, periodo, timezone);

  const tiles = [
    { etiqueta: "Pedidos aceptados", valor: String(estadisticas.pedidosAceptados) },
    { etiqueta: "Total facturado", valor: `$${formatearPrecio(estadisticas.totalFacturado)}` },
    {
      etiqueta: "Descuentos otorgados",
      valor: `$${formatearPrecio(estadisticas.descuentosOtorgados)}`,
    },
    { etiqueta: "Ticket promedio", valor: `$${formatearPrecio(estadisticas.ticketPromedio)}` },
  ];

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold">Estadísticas</h2>
        <div className="flex gap-1">
          {PERIODOS.map(({ valor, etiqueta }) => (
            <button
              key={valor}
              type="button"
              onClick={() => setPeriodo(valor)}
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                periodo === valor
                  ? "bg-(--admin-acento) text-(--admin-acento-texto)"
                  : "text-(--admin-texto-secundario) hover:bg-(--admin-acento-suave)"
              }`}
            >
              {etiqueta}
            </button>
          ))}
        </div>
      </div>

      {cargando ? (
        <p className="py-6 text-center text-(--admin-texto-secundario)">Cargando estadísticas...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {tiles.map(({ etiqueta, valor }) => (
              <div
                key={etiqueta}
                className="rounded-(--admin-radio-lg) border border-(--admin-borde) bg-(--admin-superficie) p-4 shadow-(--admin-sombra-sm)"
              >
                <p className="text-sm text-(--admin-texto-secundario)">{etiqueta}</p>
                <p className="mt-1 text-2xl font-bold tabular-nums">{valor}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 text-sm">
            <span className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-800">
              Pendientes: {estadisticas.porEstado.pendiente}
            </span>
            <span className="rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-800">
              Aceptados: {estadisticas.porEstado.aceptado}
            </span>
            <span className="rounded-full bg-(--admin-acento-suave) px-3 py-1 font-medium text-(--admin-texto-secundario)">
              Ignorados: {estadisticas.porEstado.ignorado}
            </span>
          </div>
        </>
      )}
    </section>
  );
}
