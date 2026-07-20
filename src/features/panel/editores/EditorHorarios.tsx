"use client";

import { CAMPO } from "./campos";
import type { FranjaHoraria } from "@/core/types";

// Presentado lunes a domingo; el modelo usa 0=domingo..6=sábado.
const DIAS = [
  { dia: 1, nombre: "Lunes" },
  { dia: 2, nombre: "Martes" },
  { dia: 3, nombre: "Miércoles" },
  { dia: 4, nombre: "Jueves" },
  { dia: 5, nombre: "Viernes" },
  { dia: 6, nombre: "Sábado" },
  { dia: 0, nombre: "Domingo" },
];

export function EditorHorarios({
  value,
  onChange,
}: {
  value: FranjaHoraria[];
  onChange: (horarios: FranjaHoraria[]) => void;
}) {
  const actualizar = (indice: number, cambios: Partial<FranjaHoraria>) =>
    onChange(value.map((franja, i) => (i === indice ? { ...franja, ...cambios } : franja)));

  return (
    <div className="flex flex-col gap-2">
      {DIAS.map(({ dia, nombre }) => {
        const franjasDelDia = value
          .map((franja, indice) => ({ franja, indice }))
          .filter(({ franja }) => franja.dia === dia);

        return (
          <div key={dia} className="flex flex-wrap items-center gap-2 border-b border-(--admin-borde) pb-2 last:border-0">
            <p className="w-24 text-sm font-medium">{nombre}</p>
            {franjasDelDia.length === 0 && (
              <span className="text-sm text-(--admin-texto-secundario)">Cerrado</span>
            )}
            {franjasDelDia.map(({ franja, indice }) => (
              <span key={indice} className="flex items-center gap-1">
                <input
                  type="time"
                  value={franja.apertura}
                  onChange={(evento) => actualizar(indice, { apertura: evento.target.value })}
                  aria-label={`Apertura ${nombre}`}
                  className={CAMPO}
                />
                <span className="text-(--admin-texto-secundario)">–</span>
                <input
                  type="time"
                  value={franja.cierre}
                  onChange={(evento) => actualizar(indice, { cierre: evento.target.value })}
                  aria-label={`Cierre ${nombre}`}
                  className={CAMPO}
                />
                <button
                  type="button"
                  aria-label={`Quitar franja de ${nombre}`}
                  onClick={() => onChange(value.filter((_, i) => i !== indice))}
                  className="px-1 font-bold text-(--admin-texto-secundario) hover:text-red-600"
                >
                  ×
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={() => onChange([...value, { dia, apertura: "09:00", cierre: "13:00" }])}
              className="rounded-full border border-(--admin-borde) px-3 py-1 text-xs font-semibold"
            >
              + franja
            </button>
          </div>
        );
      })}
      <p className="text-xs text-(--admin-texto-secundario)">
        Una franja que termina después de medianoche se carga con cierre menor a la apertura
        (ej. 20:00 – 02:00).
      </p>
    </div>
  );
}
