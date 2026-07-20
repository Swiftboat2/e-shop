"use client";

import { CAMPO } from "./campos";
import type { ConfigDescuentos, MetodoPago } from "@/core/types";

export function EditorDescuentos({
  value,
  metodosPago,
  onChange,
}: {
  value: ConfigDescuentos;
  metodosPago: MetodoPago[];
  onChange: (descuentos: ConfigDescuentos) => void;
}) {
  const restringido = value.soloMetodosDePago !== null;

  const toggleMetodo = (id: string) => {
    const actuales = value.soloMetodosDePago ?? [];
    const nuevos = actuales.includes(id)
      ? actuales.filter((metodo) => metodo !== id)
      : [...actuales, id];
    onChange({ ...value, soloMetodosDePago: nuevos });
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={value.activo}
          onChange={(evento) => onChange({ ...value, activo: evento.target.checked })}
          className="size-4"
        />
        Ofrecer descuentos por volumen
      </label>

      {value.activo && (
        <>
          <div className="flex flex-col gap-2">
            {value.reglas.map((regla, indice) => (
              <div key={indice} className="flex items-center gap-2 text-sm">
                <span>Desde</span>
                <input
                  type="number"
                  min="1"
                  value={regla.desdeCantidad}
                  onChange={(evento) =>
                    onChange({
                      ...value,
                      reglas: value.reglas.map((r, i) =>
                        i === indice ? { ...r, desdeCantidad: Number(evento.target.value) || 0 } : r,
                      ),
                    })
                  }
                  aria-label="Cantidad mínima de la regla"
                  className={`${CAMPO} w-20`}
                />
                <span>ítems →</span>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={regla.descuentoPorcentaje}
                  onChange={(evento) =>
                    onChange({
                      ...value,
                      reglas: value.reglas.map((r, i) =>
                        i === indice
                          ? { ...r, descuentoPorcentaje: Number(evento.target.value) || 0 }
                          : r,
                      ),
                    })
                  }
                  aria-label="Porcentaje de descuento"
                  className={`${CAMPO} w-20`}
                />
                <span>% off</span>
                <button
                  type="button"
                  aria-label="Quitar regla"
                  onClick={() =>
                    onChange({ ...value, reglas: value.reglas.filter((_, i) => i !== indice) })
                  }
                  className="px-1 font-bold text-(--admin-texto-secundario) hover:text-red-600"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...value,
                  reglas: [...value.reglas, { desdeCantidad: 10, descuentoPorcentaje: 10 }],
                })
              }
              className="w-fit rounded-(--admin-radio-md) border border-(--admin-borde) px-4 py-1.5 text-sm font-semibold"
            >
              + Agregar regla
            </button>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={restringido}
              onChange={(evento) =>
                onChange({
                  ...value,
                  soloMetodosDePago: evento.target.checked
                    ? metodosPago.filter((metodo) => metodo.activo).slice(0, 1).map((m) => m.id)
                    : null,
                })
              }
              className="size-4"
            />
            Solo para algunos métodos de pago
          </label>

          {restringido && (
            <div className="flex flex-wrap gap-3 pl-6">
              {metodosPago.map((metodo) => (
                <label key={metodo.id} className="flex items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    checked={value.soloMetodosDePago?.includes(metodo.id) ?? false}
                    onChange={() => toggleMetodo(metodo.id)}
                    className="size-4"
                  />
                  {metodo.nombre}
                </label>
              ))}
              {(value.soloMetodosDePago?.length ?? 0) === 0 && (
                <p className="text-sm text-amber-700">
                  Sin métodos marcados el descuento no aplica nunca.
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
