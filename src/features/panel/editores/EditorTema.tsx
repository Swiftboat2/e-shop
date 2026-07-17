"use client";

import { COMBOS_TIPOGRAFICOS, PALETAS } from "@/features/comercio/opciones";
import type { Tema } from "@/core/types";

export function EditorTema({ value, onChange }: { value: Tema; onChange: (tema: Tema) => void }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-2 text-sm font-medium">Paleta de colores</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PALETAS.map((paleta) => {
            const activa = paleta.colores.colorPrimario === value.colorPrimario;
            return (
              <button
                key={paleta.id}
                type="button"
                onClick={() => onChange({ ...value, ...paleta.colores })}
                className={`flex flex-col gap-1 rounded-xl border-2 p-3 text-left text-sm font-medium ${
                  activa ? "border-stone-900" : "border-stone-200"
                }`}
                style={{ backgroundColor: paleta.colores.colorFondo, color: paleta.colores.colorTexto }}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="size-5 shrink-0 rounded-full"
                    style={{ backgroundColor: paleta.colores.colorPrimario }}
                  />
                  <span
                    className="size-3 shrink-0 rounded-full"
                    style={{ backgroundColor: paleta.colores.colorSecundario }}
                  />
                  {paleta.nombre}
                </span>
                <span className="text-xs font-normal opacity-70">{paleta.descripcion}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Tipografía</p>
        <p className="mb-2 text-xs text-stone-500">
          Combinaciones ya pareadas: una fuente para títulos y precios, otra para el texto.
        </p>
        <div className="flex flex-wrap gap-2">
          {COMBOS_TIPOGRAFICOS.map((combo) => (
            <label
              key={combo.id}
              className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm ${
                value.fuente === combo.id
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-300"
              }`}
            >
              <input
                type="radio"
                name="fuenteTema"
                checked={value.fuente === combo.id}
                onChange={() => onChange({ ...value, fuente: combo.id })}
                className="sr-only"
              />
              {combo.nombre} <span className="opacity-60">· {combo.display} + {combo.texto}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
