"use client";

import { useState } from "react";
import { calcularTotalesPresupuesto } from "@/core/dominio/presupuestos";
import { formatearPrecio, redondearMoneda } from "@/core/dominio/precio";
import { CAMPO } from "./editores/campos";
import { useProductosAdmin } from "./hooksAdmin";
import { crearPresupuesto } from "./mutaciones";
import type { ItemPresupuesto } from "@/core/types";

interface FilaItem {
  descripcion: string;
  cantidad: string;
  unidad: string;
  precioUnitario: string;
}

const FILA_VACIA: FilaItem = { descripcion: "", cantidad: "1", unidad: "", precioUnitario: "" };

export function FormPresupuesto({ slug, onCerrar }: { slug: string; onCerrar: () => void }) {
  const { productos } = useProductosAdmin(slug);

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [notas, setNotas] = useState("");
  const [filas, setFilas] = useState<FilaItem[]>([{ ...FILA_VACIA }]);
  const [sugerenciasEn, setSugerenciasEn] = useState<number | null>(null);
  const [descuento, setDescuento] = useState("");
  const [validez, setValidez] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const actualizarFila = (indice: number, cambios: Partial<FilaItem>) =>
    setFilas(filas.map((fila, i) => (i === indice ? { ...fila, ...cambios } : fila)));

  const filasValidas = filas.filter(
    (fila) =>
      fila.descripcion.trim() &&
      Number(fila.cantidad) > 0 &&
      Number.isFinite(Number(fila.precioUnitario)) &&
      Number(fila.precioUnitario) >= 0,
  );

  const totales = calcularTotalesPresupuesto(
    filasValidas.map((fila) => ({
      cantidad: Number(fila.cantidad),
      precioUnitario: Number(fila.precioUnitario),
    })),
    Number(descuento) || 0,
  );

  const guardar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setError(null);
    if (!nombre.trim()) return setError("Ingresá el nombre del cliente.");
    if (filasValidas.length === 0) {
      return setError("Cargá al menos un item con descripción, cantidad y precio.");
    }

    const items: ItemPresupuesto[] = filasValidas.map((fila) => ({
      descripcion: fila.descripcion.trim(),
      cantidad: Number(fila.cantidad),
      precioUnitario: Number(fila.precioUnitario),
      subtotal: redondearMoneda(Number(fila.cantidad) * Number(fila.precioUnitario)),
      ...(fila.unidad.trim() ? { unidad: fila.unidad.trim() } : {}),
    }));

    setGuardando(true);
    try {
      await crearPresupuesto(slug, {
        datosCliente: {
          nombre: nombre.trim(),
          ...(telefono.trim() ? { telefono: telefono.trim() } : {}),
          ...(notas.trim() ? { notas: notas.trim() } : {}),
        },
        items,
        subtotal: totales.subtotal,
        total: totales.total,
        ...(Number(descuento) > 0 ? { descuentoPorcentaje: Number(descuento) } : {}),
        ...(Number(validez) > 0 ? { validezDias: Number(validez) } : {}),
      });
      onCerrar();
    } catch {
      setError("No se pudo crear el presupuesto. Probá de nuevo.");
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40">
      <button
        type="button"
        aria-label="Cerrar formulario"
        onClick={onCerrar}
        className="absolute inset-0 bg-black/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Nuevo presupuesto"
        className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-(--admin-superficie) text-(--admin-texto) shadow-2xl sm:inset-x-4 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2 sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-(--admin-borde) px-5 py-4">
          <h2 className="text-lg font-bold">Nuevo presupuesto</h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="flex size-8 items-center justify-center rounded-full bg-(--admin-acento-suave) text-lg"
          >
            ×
          </button>
        </div>

        <form onSubmit={guardar} className="flex flex-col gap-4 overflow-y-auto px-5 py-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm font-medium">
              Cliente
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} className={CAMPO} />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium">
              Teléfono (opcional)
              <input
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className={CAMPO}
              />
            </label>
          </div>

          <div className="flex flex-col gap-2 text-sm font-medium">
            Items
            {filas.map((fila, indice) => {
              const busqueda = fila.descripcion.trim().toLowerCase();
              const sugerencias =
                sugerenciasEn === indice && busqueda
                  ? productos
                      .filter((producto) => producto.nombre.toLowerCase().includes(busqueda))
                      .slice(0, 6)
                  : [];

              return (
                <div key={indice} className="relative flex flex-wrap items-center gap-2">
                  <input
                    value={fila.descripcion}
                    onChange={(e) => {
                      actualizarFila(indice, { descripcion: e.target.value });
                      setSugerenciasEn(indice);
                    }}
                    onFocus={() => setSugerenciasEn(indice)}
                    onBlur={() => setSugerenciasEn(null)}
                    placeholder="Del catálogo o descripción libre"
                    aria-label="Descripción del item"
                    className={`${CAMPO} min-w-40 flex-1`}
                  />
                  <input
                    value={fila.cantidad}
                    onChange={(e) => actualizarFila(indice, { cantidad: e.target.value })}
                    inputMode="decimal"
                    aria-label="Cantidad"
                    className={`${CAMPO} w-16`}
                  />
                  <input
                    value={fila.unidad}
                    onChange={(e) => actualizarFila(indice, { unidad: e.target.value })}
                    placeholder="unid."
                    aria-label="Unidad (opcional)"
                    className={`${CAMPO} w-16`}
                  />
                  <input
                    value={fila.precioUnitario}
                    onChange={(e) => actualizarFila(indice, { precioUnitario: e.target.value })}
                    inputMode="decimal"
                    placeholder="Precio"
                    aria-label="Precio unitario"
                    className={`${CAMPO} w-24`}
                  />
                  <button
                    type="button"
                    aria-label="Quitar item"
                    disabled={filas.length === 1}
                    onClick={() => setFilas(filas.filter((_, i) => i !== indice))}
                    className="rounded-(--admin-radio-md) border border-(--admin-borde) px-3 py-2 font-bold disabled:opacity-40"
                  >
                    ×
                  </button>

                  {sugerencias.length > 0 && (
                    <div className="absolute top-full left-0 z-10 mt-1 flex w-full max-w-md flex-col overflow-hidden rounded-(--admin-radio-md) border border-(--admin-borde) bg-(--admin-superficie) shadow-lg">
                      {sugerencias.map((producto) => (
                        <button
                          key={producto.id}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            actualizarFila(indice, {
                              descripcion: producto.nombre,
                              precioUnitario: String(producto.precio),
                              unidad: producto.unidadMedida ?? "",
                            });
                            setSugerenciasEn(null);
                          }}
                          className="flex justify-between px-3 py-2 text-left text-sm hover:bg-(--admin-acento-suave)"
                        >
                          <span>{producto.nombre}</span>
                          <span className="text-(--admin-texto-secundario)">${formatearPrecio(producto.precio)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <button
              type="button"
              onClick={() => setFilas([...filas, { ...FILA_VACIA }])}
              className="w-fit rounded-(--admin-radio-md) border border-(--admin-borde) px-4 py-1.5 font-semibold"
            >
              + Agregar item
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1 text-sm font-medium">
              Descuento % (opcional)
              <input
                value={descuento}
                onChange={(e) => setDescuento(e.target.value)}
                inputMode="numeric"
                className={CAMPO}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium">
              Validez en días (opcional)
              <input
                value={validez}
                onChange={(e) => setValidez(e.target.value)}
                inputMode="numeric"
                placeholder="7"
                className={CAMPO}
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-sm font-medium">
            Notas (opcional)
            <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={2} className={CAMPO} />
          </label>

          <div className="flex flex-col gap-1 border-t border-(--admin-borde) pt-3 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${formatearPrecio(totales.subtotal)}</span>
            </div>
            {totales.descuentoMonto > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Descuento</span>
                <span>-${formatearPrecio(totales.descuentoMonto)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span>${formatearPrecio(totales.total)}</span>
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={guardando}
            className="rounded-(--admin-radio-lg) bg-(--admin-acento) px-5 py-3 font-bold text-(--admin-acento-texto) disabled:opacity-60"
          >
            {guardando ? "Creando..." : "Crear presupuesto"}
          </button>
        </form>
      </div>
    </div>
  );
}
