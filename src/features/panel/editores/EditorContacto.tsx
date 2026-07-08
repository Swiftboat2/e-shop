"use client";

import { useState } from "react";
import { CAMPO } from "./campos";
import type { Contacto } from "@/core/types";

export function EditorContacto({
  value,
  onChange,
}: {
  value: Contacto;
  onChange: (contacto: Contacto) => void;
}) {
  // Las coordenadas se editan como texto (admiten "-31.4" a medio escribir)
  // y se propagan solo cuando son un número válido.
  const [latTexto, setLatTexto] = useState(String(value.mapLat));
  const [lngTexto, setLngTexto] = useState(String(value.mapLng));

  const cambiarCoordenada = (clave: "mapLat" | "mapLng", texto: string) => {
    if (clave === "mapLat") setLatTexto(texto);
    else setLngTexto(texto);
    const numero = Number(texto);
    if (Number.isFinite(numero)) onChange({ ...value, [clave]: numero });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Teléfono
          <input
            value={value.telefono}
            onChange={(evento) => onChange({ ...value, telefono: evento.target.value })}
            className={CAMPO}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Dirección
          <input
            value={value.direccion}
            onChange={(evento) => onChange({ ...value, direccion: evento.target.value })}
            className={CAMPO}
          />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Latitud
          <input
            inputMode="decimal"
            value={latTexto}
            onChange={(evento) => cambiarCoordenada("mapLat", evento.target.value)}
            className={CAMPO}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Longitud
          <input
            inputMode="decimal"
            value={lngTexto}
            onChange={(evento) => cambiarCoordenada("mapLng", evento.target.value)}
            className={CAMPO}
          />
        </label>
      </div>
      <p className="text-xs text-stone-500">
        En Google Maps: click derecho sobre tu local → el primer ítem copia las coordenadas.
      </p>
      {(value.mapLat !== 0 || value.mapLng !== 0) && (
        <iframe
          title="Vista previa de la ubicación"
          src={`https://maps.google.com/maps?q=${value.mapLat},${value.mapLng}&z=15&output=embed`}
          className="h-44 w-full rounded-xl border border-stone-200"
          loading="lazy"
        />
      )}
    </div>
  );
}
