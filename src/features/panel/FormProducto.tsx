"use client";

import { useState } from "react";
import { guardarProducto, subirImagenProducto } from "./mutaciones";
import type { Categoria, Producto, UnidadDeVenta } from "@/core/types";

interface Props {
  slug: string;
  unidadesDeVenta: UnidadDeVenta[];
  categorias: Categoria[];
  /** null = alta */
  producto: Producto | null;
  ordenSiguiente: number;
  ordenCategoriaSiguiente: number;
  onCerrar: () => void;
}

const CAMPO =
  "rounded-(--admin-radio-md) border border-(--admin-borde) bg-(--admin-superficie) px-3 py-2 text-base";

export function FormProducto({
  slug,
  unidadesDeVenta,
  categorias,
  producto,
  ordenSiguiente,
  ordenCategoriaSiguiente,
  onCerrar,
}: Props) {
  const [nombre, setNombre] = useState(producto?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(producto?.descripcion ?? "");
  const [codigoBarras, setCodigoBarras] = useState(producto?.codigoBarras ?? "");
  const [precio, setPrecio] = useState(producto ? String(producto.precio) : "");
  const [disponible, setDisponible] = useState(producto?.disponible ?? true);
  const [archivoImagen, setArchivoImagen] = useState<File | null>(null);

  // Convención: valor "unidad" → tipoVenta "unidad"; cualquier otro valor →
  // "fraccionado" con unidadMedida = ese valor. Con una sola unidad de venta
  // configurada no se muestra ningún selector.
  const [formatoValor, setFormatoValor] = useState(
    producto?.tipoVenta === "fraccionado"
      ? (producto.unidadMedida ?? "unidad")
      : (unidadesDeVenta[0]?.valor ?? "unidad"),
  );
  const esFraccionado = formatoValor !== "unidad";
  const [pasoIncremento, setPasoIncremento] = useState(
    producto?.pasoIncremento ? String(producto.pasoIncremento) : "1",
  );
  const [cantidadMinima, setCantidadMinima] = useState(
    producto?.cantidadMinima ? String(producto.cantidadMinima) : "1",
  );

  const [beneficios, setBeneficios] = useState<string[]>(producto?.beneficios ?? []);
  const [beneficioNuevo, setBeneficioNuevo] = useState("");

  const categoriaInicial = categorias.find((c) => c.id === producto?.categoriaId);
  const [busquedaCategoria, setBusquedaCategoria] = useState(categoriaInicial?.nombre ?? "");
  const [categoriaId, setCategoriaId] = useState<string | null>(categoriaInicial?.id ?? null);
  const [categoriaNueva, setCategoriaNueva] = useState<string | null>(null);
  const [comboAbierto, setComboAbierto] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const filtradas = categorias.filter((categoria) =>
    categoria.nombre.toLowerCase().includes(busquedaCategoria.trim().toLowerCase()),
  );
  const coincidenciaExacta = categorias.some(
    (categoria) => categoria.nombre.toLowerCase() === busquedaCategoria.trim().toLowerCase(),
  );

  const elegirCategoria = (categoria: Categoria) => {
    setCategoriaId(categoria.id);
    setCategoriaNueva(null);
    setBusquedaCategoria(categoria.nombre);
    setComboAbierto(false);
  };

  const crearCategoria = () => {
    setCategoriaNueva(busquedaCategoria.trim());
    setCategoriaId(null);
    setComboAbierto(false);
  };

  const agregarBeneficio = () => {
    const texto = beneficioNuevo.trim();
    if (texto && !beneficios.includes(texto)) setBeneficios([...beneficios, texto]);
    setBeneficioNuevo("");
  };

  const guardar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setError(null);

    const precioNumero = Number(precio);
    if (!nombre.trim()) return setError("El nombre es obligatorio.");
    if (!Number.isFinite(precioNumero) || precioNumero <= 0) {
      return setError("El precio tiene que ser mayor a cero.");
    }
    if (!categoriaId && !categoriaNueva) {
      return setError("Elegí una categoría o creá una nueva.");
    }
    const paso = Number(pasoIncremento) > 0 ? Number(pasoIncremento) : 1;
    const minimo = Number(cantidadMinima) > 0 ? Number(cantidadMinima) : paso;

    setGuardando(true);
    try {
      let imagenUrl = producto?.imagenUrl ?? "";
      if (archivoImagen) imagenUrl = await subirImagenProducto(slug, archivoImagen);

      await guardarProducto({
        slug,
        productoId: producto?.id ?? null,
        datos: {
          nombre: nombre.trim(),
          descripcion: descripcion.trim(),
          imagenUrl,
          disponible,
          orden: producto?.orden ?? ordenSiguiente,
          tipoVenta: esFraccionado ? "fraccionado" : "unidad",
          precio: precioNumero,
          ...(codigoBarras.trim() ? { codigoBarras: codigoBarras.trim() } : {}),
          ...(esFraccionado
            ? { unidadMedida: formatoValor, pasoIncremento: paso, cantidadMinima: minimo }
            : {}),
          ...(beneficios.length ? { beneficios } : {}),
        },
        categoriaExistenteId: categoriaId,
        categoriaNueva,
        ordenCategoria: ordenCategoriaSiguiente,
      });
      onCerrar();
    } catch {
      setError("No se pudo guardar el producto. Probá de nuevo.");
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
        aria-label={producto ? "Editar producto" : "Nuevo producto"}
        className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl bg-(--admin-superficie) text-(--admin-texto) shadow-2xl sm:inset-x-4 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2 sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-(--admin-borde) px-5 py-4">
          <h2 className="text-lg font-bold">{producto ? "Editar producto" : "Nuevo producto"}</h2>
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
          <label className="flex flex-col gap-1 text-sm font-medium">
            Nombre
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} className={CAMPO} />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium">
            Descripción corta
            <input
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className={CAMPO}
            />
          </label>

          <div className="relative flex flex-col gap-1 text-sm font-medium">
            Categoría
            <input
              value={busquedaCategoria}
              onChange={(e) => {
                setBusquedaCategoria(e.target.value);
                setCategoriaId(null);
                setCategoriaNueva(null);
                setComboAbierto(true);
              }}
              onFocus={() => setComboAbierto(true)}
              onBlur={() => setComboAbierto(false)}
              placeholder="Buscá o escribí una nueva"
              className={CAMPO}
            />
            {categoriaNueva && (
              <p className="text-xs font-normal text-emerald-700">
                Se va a crear la categoría &quot;{categoriaNueva}&quot; al guardar.
              </p>
            )}
            {comboAbierto && (busquedaCategoria.trim() || filtradas.length > 0) && (
              <div className="absolute top-full z-10 mt-1 flex w-full flex-col overflow-hidden rounded-(--admin-radio-md) border border-(--admin-borde) bg-(--admin-superficie) shadow-lg">
                {filtradas.map((categoria) => (
                  <button
                    key={categoria.id}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      elegirCategoria(categoria);
                    }}
                    className="px-3 py-2 text-left text-sm hover:bg-(--admin-acento-suave)"
                  >
                    {categoria.nombre}
                  </button>
                ))}
                {busquedaCategoria.trim() && !coincidenciaExacta && (
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      crearCategoria();
                    }}
                    className="border-t border-(--admin-borde) px-3 py-2 text-left text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                  >
                    + Crear categoría &quot;{busquedaCategoria.trim()}&quot;
                  </button>
                )}
              </div>
            )}
          </div>

          {unidadesDeVenta.length > 1 && (
            <fieldset className="text-sm font-medium">
              <legend className="mb-2">Formato de venta</legend>
              <div className="flex flex-wrap gap-2">
                {unidadesDeVenta.map((unidad) => (
                  <label
                    key={unidad.valor}
                    className={`cursor-pointer rounded-full border px-4 py-1.5 ${
                      formatoValor === unidad.valor
                        ? "border-(--admin-acento) bg-(--admin-acento) text-(--admin-acento-texto)"
                        : "border-(--admin-borde)"
                    }`}
                  >
                    <input
                      type="radio"
                      name="formatoVenta"
                      value={unidad.valor}
                      checked={formatoValor === unidad.valor}
                      onChange={() => setFormatoValor(unidad.valor)}
                      className="sr-only"
                    />
                    {unidad.etiqueta}
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1 text-sm font-medium">
              Precio {esFraccionado ? `por ${formatoValor}` : ""}
              <input
                type="number"
                step="any"
                min="0"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                className={CAMPO}
              />
            </label>
            {esFraccionado && (
              <>
                <label className="flex flex-col gap-1 text-sm font-medium">
                  De a cuánto suma el +
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={pasoIncremento}
                    onChange={(e) => setPasoIncremento(e.target.value)}
                    className={CAMPO}
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium">
                  Cantidad mínima
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={cantidadMinima}
                    onChange={(e) => setCantidadMinima(e.target.value)}
                    className={CAMPO}
                  />
                </label>
              </>
            )}
          </div>

          <label className="flex flex-col gap-1 text-sm font-medium">
            Código de barras (opcional, solo visible acá)
            <input
              value={codigoBarras}
              onChange={(e) => setCodigoBarras(e.target.value)}
              className={CAMPO}
            />
          </label>

          <div className="flex flex-col gap-2 text-sm font-medium">
            Beneficios del producto (opcional)
            <div className="flex gap-2">
              <input
                value={beneficioNuevo}
                onChange={(e) => setBeneficioNuevo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    agregarBeneficio();
                  }
                }}
                placeholder='Ej. "sin conservantes"'
                className={`${CAMPO} flex-1`}
              />
              <button
                type="button"
                onClick={agregarBeneficio}
                className="rounded-(--admin-radio-md) border border-(--admin-borde) px-4 font-semibold"
              >
                Agregar
              </button>
            </div>
            {beneficios.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {beneficios.map((beneficio) => (
                  <span
                    key={beneficio}
                    className="flex items-center gap-1 rounded-full bg-(--admin-acento-suave) px-3 py-1 text-xs"
                  >
                    {beneficio}
                    <button
                      type="button"
                      aria-label={`Quitar ${beneficio}`}
                      onClick={() => setBeneficios(beneficios.filter((b) => b !== beneficio))}
                      className="font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <label className="flex flex-col gap-1 text-sm font-medium">
            Imagen (opcional)
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setArchivoImagen(e.target.files?.[0] ?? null)}
              className="text-sm"
            />
          </label>

          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={disponible}
              onChange={(e) => setDisponible(e.target.checked)}
              className="size-4"
            />
            Disponible en el catálogo
          </label>

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
            {guardando ? "Guardando..." : producto ? "Guardar cambios" : "Crear producto"}
          </button>
        </form>
      </div>
    </div>
  );
}
