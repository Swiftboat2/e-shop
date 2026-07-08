"use client";

import { useState } from "react";
import { CAMPO } from "./campos";
import type { MetodoPago } from "@/core/types";

function normalizarId(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function EditorMetodosPago({
  value,
  onChange,
}: {
  value: MetodoPago[];
  onChange: (metodos: MetodoPago[]) => void;
}) {
  const [nombreNuevo, setNombreNuevo] = useState("");
  const hayActivo = value.some((metodo) => metodo.activo);

  const agregar = () => {
    const nombre = nombreNuevo.trim();
    if (!nombre) return;
    let id = normalizarId(nombre) || "metodo";
    while (value.some((metodo) => metodo.id === id)) id = `${id}-2`;
    onChange([...value, { id, nombre, activo: true }]);
    setNombreNuevo("");
  };

  return (
    <div className="flex flex-col gap-2">
      {value.map((metodo, indice) => (
        <div key={metodo.id} className="flex items-center gap-2">
          <input
            value={metodo.nombre}
            onChange={(evento) =>
              onChange(
                value.map((m, i) => (i === indice ? { ...m, nombre: evento.target.value } : m)),
              )
            }
            aria-label="Nombre del método de pago"
            className={`${CAMPO} flex-1`}
          />
          <label className="flex items-center gap-1.5 text-sm">
            <input
              type="checkbox"
              checked={metodo.activo}
              onChange={(evento) =>
                onChange(
                  value.map((m, i) => (i === indice ? { ...m, activo: evento.target.checked } : m)),
                )
              }
              className="size-4"
            />
            Activo
          </label>
          <button
            type="button"
            aria-label={`Quitar ${metodo.nombre}`}
            disabled={value.length === 1}
            onClick={() => onChange(value.filter((_, i) => i !== indice))}
            className="rounded-lg border border-stone-300 px-3 py-2 font-bold disabled:opacity-40"
          >
            ×
          </button>
        </div>
      ))}

      <div className="flex gap-2">
        <input
          value={nombreNuevo}
          onChange={(evento) => setNombreNuevo(evento.target.value)}
          onKeyDown={(evento) => {
            if (evento.key === "Enter") {
              evento.preventDefault();
              agregar();
            }
          }}
          placeholder='Ej. "Mercado Pago"'
          className={`${CAMPO} flex-1`}
        />
        <button
          type="button"
          onClick={agregar}
          className="rounded-lg border border-stone-300 px-4 font-semibold"
        >
          Agregar
        </button>
      </div>

      {!hayActivo && (
        <p className="text-sm font-medium text-amber-700">
          Activá al menos un método para que el checkout de tu tienda funcione.
        </p>
      )}
    </div>
  );
}
