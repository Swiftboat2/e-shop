"use client";

import { FUENTES_DISPONIBLES, PALETAS } from "@/features/comercio/opciones";
import type { Tema } from "@/core/types";

export function EditorTema({ value, onChange }: { value: Tema; onChange: (tema: Tema) => void }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-2 text-sm font-medium">Paleta de colores</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PALETAS.map((paleta) => {
            const activa = paleta.colores.colorPrimario === value.colorPrimario;
            return (
              <button
                key={paleta.id}
                type="button"
                onClick={() => onChange({ ...value, ...paleta.colores })}
                className={`flex items-center gap-2 rounded-xl border-2 p-3 text-left text-sm font-medium ${
                  activa ? "border-stone-900" : "border-stone-200"
                }`}
                style={{ backgroundColor: paleta.colores.colorFondo, color: paleta.colores.colorTexto }}
              >
                <span
                  className="size-5 shrink-0 rounded-full"
                  style={{ backgroundColor: paleta.colores.colorPrimario }}
                />
                <span
                  className="size-3 shrink-0 rounded-full"
                  style={{ backgroundColor: paleta.colores.colorSecundario }}
                />
                {paleta.nombre}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Tipografía</p>
        <div className="flex flex-wrap gap-2">
          {FUENTES_DISPONIBLES.map((fuente) => (
            <label
              key={fuente.id}
              className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm ${
                value.fuente === fuente.id
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-300"
              }`}
            >
              <input
                type="radio"
                name="fuenteTema"
                checked={value.fuente === fuente.id}
                onChange={() => onChange({ ...value, fuente: fuente.id })}
                className="sr-only"
              />
              {fuente.nombre} <span className="opacity-60">· {fuente.descripcion}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
