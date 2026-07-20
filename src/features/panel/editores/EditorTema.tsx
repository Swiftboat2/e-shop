"use client";

import {
  DENSIDADES_DISPONIBLES,
  FUENTES_DISPONIBLES,
  PALETAS,
  RADIOS_DISPONIBLES,
} from "@/features/comercio/opciones";
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
                  activa ? "border-(--admin-acento)" : "border-(--admin-borde)"
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
                  ? "border-(--admin-acento) bg-(--admin-acento) text-(--admin-acento-texto)"
                  : "border-(--admin-borde)"
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

      <div>
        <p className="mb-2 text-sm font-medium">Esquinas</p>
        <div className="flex flex-wrap gap-2">
          {RADIOS_DISPONIBLES.map((radio) => (
            <label
              key={radio.id}
              className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm ${
                value.radio === radio.id
                  ? "border-(--admin-acento) bg-(--admin-acento) text-(--admin-acento-texto)"
                  : "border-(--admin-borde)"
              }`}
            >
              <input
                type="radio"
                name="radioTema"
                checked={value.radio === radio.id}
                onChange={() => onChange({ ...value, radio: radio.id })}
                className="sr-only"
              />
              {radio.nombre}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Densidad</p>
        <div className="flex flex-wrap gap-2">
          {DENSIDADES_DISPONIBLES.map((densidad) => (
            <label
              key={densidad.id}
              className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm ${
                value.densidad === densidad.id
                  ? "border-(--admin-acento) bg-(--admin-acento) text-(--admin-acento-texto)"
                  : "border-(--admin-borde)"
              }`}
            >
              <input
                type="radio"
                name="densidadTema"
                checked={value.densidad === densidad.id}
                onChange={() => onChange({ ...value, densidad: densidad.id })}
                className="sr-only"
              />
              {densidad.nombre}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
