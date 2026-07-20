"use client";

import { useState } from "react";
import { CAMPO } from "./campos";
import type { UnidadDeVenta } from "@/core/types";

export function EditorUnidades({
  value,
  onChange,
}: {
  value: UnidadDeVenta[];
  onChange: (unidades: UnidadDeVenta[]) => void;
}) {
  const [valorNuevo, setValorNuevo] = useState("");
  const [etiquetaNueva, setEtiquetaNueva] = useState("");

  const agregar = () => {
    const valor = valorNuevo.trim().toLowerCase().replace(/\s+/g, "");
    const etiqueta = etiquetaNueva.trim();
    if (!valor || !etiqueta) return;
    if (value.some((unidad) => unidad.valor === valor)) return;
    onChange([...value, { valor, etiqueta }]);
    setValorNuevo("");
    setEtiquetaNueva("");
  };

  return (
    <div className="flex flex-col gap-2">
      {value.map((unidad, indice) => (
        <div key={unidad.valor} className="flex items-center gap-2">
          <span className="w-24 rounded-(--admin-radio-md) bg-(--admin-acento-suave) px-3 py-2 text-sm font-mono">
            {unidad.valor}
          </span>
          <input
            value={unidad.etiqueta}
            onChange={(evento) =>
              onChange(
                value.map((u, i) => (i === indice ? { ...u, etiqueta: evento.target.value } : u)),
              )
            }
            aria-label={`Etiqueta de ${unidad.valor}`}
            className={`${CAMPO} flex-1`}
          />
          <button
            type="button"
            aria-label={`Quitar ${unidad.etiqueta}`}
            disabled={value.length === 1}
            onClick={() => onChange(value.filter((_, i) => i !== indice))}
            className="rounded-(--admin-radio-md) border border-(--admin-borde) px-3 py-2 font-bold disabled:opacity-40"
          >
            ×
          </button>
        </div>
      ))}

      <div className="flex gap-2">
        <input
          value={valorNuevo}
          onChange={(evento) => setValorNuevo(evento.target.value)}
          placeholder="kg"
          aria-label="Valor corto de la unidad"
          className={`${CAMPO} w-24`}
        />
        <input
          value={etiquetaNueva}
          onChange={(evento) => setEtiquetaNueva(evento.target.value)}
          onKeyDown={(evento) => {
            if (evento.key === "Enter") {
              evento.preventDefault();
              agregar();
            }
          }}
          placeholder='Ej. "Por kilo"'
          className={`${CAMPO} flex-1`}
        />
        <button
          type="button"
          onClick={agregar}
          className="rounded-(--admin-radio-md) border border-(--admin-borde) px-4 font-semibold"
        >
          Agregar
        </button>
      </div>

      <p className="text-xs text-(--admin-texto-secundario)">
        El valor &quot;unidad&quot; es la venta por unidad entera; cualquier otro (kg, litro,
        metro...) se vende fraccionado por esa medida.
      </p>
    </div>
  );
}
