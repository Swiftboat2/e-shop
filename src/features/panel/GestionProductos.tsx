"use client";

import { useState } from "react";
import { formatearPrecio } from "@/core/dominio/precio";
import { FormProducto } from "./FormProducto";
import { useCategoriasAdmin, useProductosAdmin } from "./hooksAdmin";
import { eliminarProducto } from "./mutaciones";
import type { Producto, UnidadDeVenta } from "@/core/types";

interface Props {
  slug: string;
  unidadesDeVenta: UnidadDeVenta[];
}

export function GestionProductos({ slug, unidadesDeVenta }: Props) {
  const { productos, cargando } = useProductosAdmin(slug);
  const { categorias } = useCategoriasAdmin(slug);

  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [formAbierto, setFormAbierto] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [eliminando, setEliminando] = useState<string | null>(null);

  const nombreCategoria = new Map(categorias.map((c) => [c.id, c.nombre]));
  const filtrados = productos
    .filter((p) => p.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()))
    .filter((p) => filtroCategoria === "todas" || p.categoriaId === filtroCategoria);

  const ordenSiguiente = productos.length
    ? Math.max(...productos.map((p) => p.orden)) + 1
    : 1;
  const ordenCategoriaSiguiente = categorias.length
    ? Math.max(...categorias.map((c) => c.orden)) + 1
    : 1;

  const cerrarForm = () => {
    setFormAbierto(false);
    setEditando(null);
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Productos</h1>
        <button
          type="button"
          onClick={() => setFormAbierto(true)}
          className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Nuevo producto
        </button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre"
          className="flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2"
        />
        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          aria-label="Filtrar por categoría"
          className="rounded-lg border border-stone-300 bg-white px-3 py-2"
        >
          <option value="todas">Todas las categorías</option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nombre}
            </option>
          ))}
        </select>
      </div>

      {cargando ? (
        <p className="py-8 text-center text-stone-500">Cargando catálogo...</p>
      ) : filtrados.length === 0 ? (
        <p className="rounded-xl border border-dashed border-stone-300 bg-white px-4 py-8 text-center text-stone-500">
          {productos.length === 0
            ? "Todavía no cargaste productos. Creá el primero con el botón de arriba."
            : "Ningún producto coincide con la búsqueda."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
          <table className="w-full min-w-125 text-left text-sm">
            <thead className="border-b border-stone-200 text-xs uppercase text-stone-500">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((producto) => (
                <tr key={producto.id} className="border-b border-stone-100 last:border-0">
                  <td className="px-4 py-3 font-medium">{producto.nombre}</td>
                  <td className="px-4 py-3 text-stone-600">
                    {nombreCategoria.get(producto.categoriaId) ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    ${formatearPrecio(producto.precio)}
                    {producto.tipoVenta === "fraccionado" && producto.unidadMedida && (
                      <span className="text-stone-500"> /{producto.unidadMedida}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        producto.disponible
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-stone-100 text-stone-500"
                      }`}
                    >
                      {producto.disponible ? "Disponible" : "Oculto"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {eliminando === producto.id ? (
                      <span className="flex items-center justify-end gap-2 text-xs">
                        ¿Eliminar?
                        <button
                          type="button"
                          onClick={() => {
                            void eliminarProducto(slug, producto.id);
                            setEliminando(null);
                          }}
                          className="font-bold text-red-600"
                        >
                          Sí
                        </button>
                        <button
                          type="button"
                          onClick={() => setEliminando(null)}
                          className="font-bold"
                        >
                          No
                        </button>
                      </span>
                    ) : (
                      <span className="flex items-center justify-end gap-3 text-sm">
                        <button
                          type="button"
                          onClick={() => {
                            setEditando(producto);
                            setFormAbierto(true);
                          }}
                          className="font-medium text-stone-600 hover:text-stone-900"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => setEliminando(producto.id)}
                          className="font-medium text-red-600 hover:text-red-700"
                        >
                          Eliminar
                        </button>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formAbierto && (
        <FormProducto
          key={editando?.id ?? "nuevo"}
          slug={slug}
          unidadesDeVenta={unidadesDeVenta}
          categorias={categorias}
          producto={editando}
          ordenSiguiente={ordenSiguiente}
          ordenCategoriaSiguiente={ordenCategoriaSiguiente}
          onCerrar={cerrarForm}
        />
      )}
    </section>
  );
}
