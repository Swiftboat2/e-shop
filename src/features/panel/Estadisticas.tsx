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
                periodo === valor ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-200"
              }`}
            >
              {etiqueta}
            </button>
          ))}
        </div>
      </div>

      {cargando ? (
        <p className="py-6 text-center text-stone-500">Cargando estadísticas...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {tiles.map(({ etiqueta, valor }) => (
              <div key={etiqueta} className="rounded-xl border border-stone-200 bg-white p-4">
                <p className="text-sm text-stone-500">{etiqueta}</p>
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
            <span className="rounded-full bg-stone-200 px-3 py-1 font-medium text-stone-600">
              Ignorados: {estadisticas.porEstado.ignorado}
            </span>
          </div>
        </>
      )}
    </section>
  );
}
