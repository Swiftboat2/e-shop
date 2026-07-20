"use client";

import { useState } from "react";
import { formatearPrecio } from "@/core/dominio/precio";
import { FormPresupuesto } from "./FormPresupuesto";
import { formatearFechaCorta, formatearNumeroPresupuesto } from "./formato";
import { usePresupuestosAdmin } from "./hooksAdmin";
import { actualizarEstadoPresupuesto } from "./mutaciones";
import type { DatosComercioPdf } from "./PdfPresupuesto";
import type { EstadoPresupuesto, Presupuesto } from "@/core/types";

const ESTADOS: { valor: EstadoPresupuesto; etiqueta: string }[] = [
  { valor: "borrador", etiqueta: "Borrador" },
  { valor: "enviado", etiqueta: "Enviado" },
  { valor: "aceptado", etiqueta: "Aceptado" },
  { valor: "vencido", etiqueta: "Vencido" },
];

async function descargarPdf(presupuesto: Presupuesto, comercio: DatosComercioPdf) {
  // Carga diferida: react-pdf es pesado y solo hace falta al exportar.
  const [{ pdf }, { PdfPresupuesto }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("./PdfPresupuesto"),
  ]);

  const blob = await pdf(
    <PdfPresupuesto presupuesto={presupuesto} comercio={comercio} />,
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `presupuesto-${formatearNumeroPresupuesto(presupuesto.numero).slice(1)}.pdf`;
  enlace.click();
  URL.revokeObjectURL(url);
}

export function GestionPresupuestos({
  slug,
  comercio,
}: {
  slug: string;
  comercio: DatosComercioPdf;
}) {
  const { presupuestos, cargando } = usePresupuestosAdmin(slug);
  const [formAbierto, setFormAbierto] = useState(false);
  const [exportando, setExportando] = useState<string | null>(null);

  const exportar = async (presupuesto: Presupuesto) => {
    setExportando(presupuesto.id);
    try {
      await descargarPdf(presupuesto, comercio);
    } finally {
      setExportando(null);
    }
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Presupuestos</h1>
          <p className="text-sm text-(--admin-texto-secundario)">
            Cotizaciones no vinculantes — no son comprobantes fiscales.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFormAbierto(true)}
          className="rounded-(--admin-radio-md) bg-(--admin-acento) px-4 py-2 text-sm font-semibold text-(--admin-acento-texto)"
        >
          Nuevo presupuesto
        </button>
      </div>

      {cargando ? (
        <p className="py-8 text-center text-(--admin-texto-secundario)">Cargando presupuestos...</p>
      ) : presupuestos.length === 0 ? (
        <p className="rounded-(--admin-radio-lg) border border-dashed border-(--admin-borde) bg-(--admin-superficie) px-4 py-8 text-center text-(--admin-texto-secundario)">
          Todavía no generaste presupuestos. Creá el primero con el botón de arriba.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {presupuestos.map((presupuesto) => (
            <li
              key={presupuesto.id}
              className="rounded-(--admin-radio-lg) border border-(--admin-borde) bg-(--admin-superficie) p-4 shadow-(--admin-sombra-sm)"
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bold">{formatearNumeroPresupuesto(presupuesto.numero)}</p>
                <p className="text-sm text-(--admin-texto-secundario)">
                  {formatearFechaCorta(presupuesto.createdAt)}
                </p>
                <p className="text-sm text-(--admin-texto-secundario)">{presupuesto.datosCliente.nombre}</p>
                {presupuesto.validezDias && (
                  <p className="text-xs text-(--admin-texto-secundario)">
                    Válido {presupuesto.validezDias} días
                  </p>
                )}
                <p className="ml-auto font-bold">${formatearPrecio(presupuesto.total)}</p>
              </div>

              <ul className="mt-2 text-sm text-(--admin-texto)">
                {presupuesto.items.map((item, indice) => (
                  <li key={indice}>
                    {formatearPrecio(item.cantidad)}
                    {item.unidad ? ` ${item.unidad}` : "x"} {item.descripcion} — $
                    {formatearPrecio(item.subtotal)}
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex items-center gap-2">
                <select
                  value={presupuesto.estado}
                  onChange={(evento) =>
                    void actualizarEstadoPresupuesto(
                      slug,
                      presupuesto.id,
                      evento.target.value as EstadoPresupuesto,
                    )
                  }
                  aria-label={`Estado del presupuesto ${formatearNumeroPresupuesto(presupuesto.numero)}`}
                  className="rounded-(--admin-radio-md) border border-(--admin-borde) bg-(--admin-superficie) px-3 py-1.5 text-sm"
                >
                  {ESTADOS.map(({ valor, etiqueta }) => (
                    <option key={valor} value={valor}>
                      {etiqueta}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={exportando === presupuesto.id}
                  onClick={() => void exportar(presupuesto)}
                  className="rounded-(--admin-radio-md) border border-(--admin-borde) px-4 py-1.5 text-sm font-semibold text-(--admin-texto-secundario) disabled:opacity-60"
                >
                  {exportando === presupuesto.id ? "Generando..." : "Descargar PDF"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {formAbierto && <FormPresupuesto slug={slug} onCerrar={() => setFormAbierto(false)} />}
    </section>
  );
}
