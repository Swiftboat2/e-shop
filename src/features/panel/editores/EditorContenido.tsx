"use client";

import { ICONOS_FEATURES } from "@/features/comercio/opciones";
import { CAMPO } from "./campos";
import type { Contenido, Feature } from "@/core/types";

interface Props {
  contenido: Contenido;
  onContenido: (contenido: Contenido) => void;
  /** Solo la Configuración edita features; el onboarding no los pasa. */
  features?: Feature[];
  onFeatures?: (features: Feature[]) => void;
}

export function EditorContenido({ contenido, onContenido, features, onFeatures }: Props) {
  const campo = (clave: keyof Contenido) => ({
    value: contenido[clave],
    onChange: (evento: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onContenido({ ...contenido, [clave]: evento.target.value }),
  });

  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm font-medium">
        Etiqueta destacada (badge)
        <input {...campo("heroBadge")} placeholder='Ej. "Pedidos por WhatsApp"' className={CAMPO} />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Título
          <input {...campo("heroTitulo")} placeholder='Ej. "Todo lo natural,"' className={CAMPO} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Título destacado (en color)
          <input
            {...campo("heroTituloDestacado")}
            placeholder='Ej. "a un mensaje de distancia"'
            className={CAMPO}
          />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Descripción
        <textarea {...campo("heroDescripcion")} rows={2} className={CAMPO} />
      </label>

      {features && onFeatures && (
        <div className="flex flex-col gap-2 text-sm font-medium">
          Diferenciales del negocio
          {features.map((feature, indice) => (
            <div key={indice} className="flex gap-2">
              <select
                value={feature.icono}
                onChange={(evento) =>
                  onFeatures(
                    features.map((f, i) =>
                      i === indice ? { ...f, icono: evento.target.value } : f,
                    ),
                  )
                }
                aria-label="Ícono"
                className={CAMPO}
              >
                {ICONOS_FEATURES.map((icono) => (
                  <option key={icono.id} value={icono.id}>
                    {icono.nombre}
                  </option>
                ))}
              </select>
              <input
                value={feature.texto}
                onChange={(evento) =>
                  onFeatures(
                    features.map((f, i) =>
                      i === indice ? { ...f, texto: evento.target.value } : f,
                    ),
                  )
                }
                placeholder='Ej. "Envíos en el día"'
                className={`${CAMPO} flex-1`}
              />
              <button
                type="button"
                aria-label="Quitar diferencial"
                onClick={() => onFeatures(features.filter((_, i) => i !== indice))}
                className="rounded-lg border border-stone-300 px-3 font-bold"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => onFeatures([...features, { icono: "check", texto: "" }])}
            className="w-fit rounded-lg border border-stone-300 px-4 py-1.5 font-semibold"
          >
            + Agregar diferencial
          </button>
        </div>
      )}
    </div>
  );
}
