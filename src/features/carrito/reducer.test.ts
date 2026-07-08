import { describe, expect, it } from "vitest";
import { carritoReducer, type ItemDelCarrito } from "@/features/carrito/reducer";
import type { Producto } from "@/core/types";

const producto = (parcial?: Partial<Producto>): Producto => ({
  id: "p1",
  nombre: "Yerba Mate Orgánica 1kg",
  descripcion: "",
  imagenUrl: "",
  disponible: true,
  orden: 1,
  categoriaId: "c1",
  tipoVenta: "unidad",
  precio: 8500,
  ...parcial,
});

const almendras = producto({
  id: "alm",
  nombre: "Almendras",
  tipoVenta: "fraccionado",
  precio: 28000,
  unidadMedida: "kg",
  pasoIncremento: 0.25,
  cantidadMinima: 0.25,
});

describe("carritoReducer", () => {
  it("agrega un producto por unidad arrancando en cantidad 1", () => {
    const items = carritoReducer([], { tipo: "agregar", producto: producto() });
    expect(items).toEqual([
      {
        productoId: "p1",
        nombre: "Yerba Mate Orgánica 1kg",
        precio: 8500,
        cantidad: 1,
        paso: 1,
        minimo: 1,
      },
    ]);
  });

  it("agrega un fraccionado arrancando en su cantidad mínima, con unidad y paso", () => {
    const items = carritoReducer([], { tipo: "agregar", producto: almendras });
    expect(items).toEqual([
      {
        productoId: "alm",
        nombre: "Almendras",
        precio: 28000,
        cantidad: 0.25,
        unidadMedida: "kg",
        paso: 0.25,
        minimo: 0.25,
      },
    ]);
  });

  it("agregar un producto ya presente suma su paso", () => {
    let items = carritoReducer([], { tipo: "agregar", producto: producto() });
    items = carritoReducer(items, { tipo: "agregar", producto: producto() });
    expect(items[0].cantidad).toBe(2);

    let fraccionado = carritoReducer([], { tipo: "agregar", producto: almendras });
    fraccionado = carritoReducer(fraccionado, { tipo: "agregar", producto: almendras });
    expect(fraccionado[0].cantidad).toBe(0.5);
  });

  it("fraccionado sin paso configurado usa 1", () => {
    const sinPaso = producto({ id: "gr", tipoVenta: "fraccionado", unidadMedida: "litro" });
    const items = carritoReducer([], { tipo: "agregar", producto: sinPaso });
    expect(items[0]).toMatchObject({ cantidad: 1, paso: 1, minimo: 1 });
  });

  it("incrementar suma el paso guardado en el propio item", () => {
    let items = carritoReducer([], { tipo: "agregar", producto: almendras });
    items = carritoReducer(items, { tipo: "incrementar", productoId: "alm" });
    expect(items[0].cantidad).toBe(0.5);

    expect(carritoReducer(items, { tipo: "incrementar", productoId: "no-existe" })).toEqual(items);
  });

  it("quitar resta el paso y elimina el item al caer bajo el mínimo", () => {
    let items = carritoReducer([], { tipo: "agregar", producto: producto() });
    items = carritoReducer(items, { tipo: "agregar", producto: producto() });

    items = carritoReducer(items, { tipo: "quitar", productoId: "p1" });
    expect(items[0].cantidad).toBe(1);

    items = carritoReducer(items, { tipo: "quitar", productoId: "p1" });
    expect(items).toEqual([]);
  });

  it("quitar un producto que no está no cambia nada", () => {
    const items = carritoReducer([], { tipo: "agregar", producto: producto() });
    expect(carritoReducer(items, { tipo: "quitar", productoId: "otro" })).toEqual(items);
  });

  it("eliminar saca el item completo y vaciar deja el carrito vacío", () => {
    let items = carritoReducer([], { tipo: "agregar", producto: producto() });
    items = carritoReducer(items, { tipo: "agregar", producto: almendras });

    expect(carritoReducer(items, { tipo: "eliminar", productoId: "p1" })).toHaveLength(1);
    expect(carritoReducer(items, { tipo: "vaciar" })).toEqual([]);
  });

  it("mantiene cantidades fraccionadas exactas al acumular pasos", () => {
    let items = carritoReducer([], { tipo: "agregar", producto: almendras });
    items = carritoReducer(items, { tipo: "incrementar", productoId: "alm" });
    items = carritoReducer(items, { tipo: "incrementar", productoId: "alm" });
    expect(items[0].cantidad).toBe(0.75);
  });

  it("cargar reemplaza el estado completo", () => {
    const guardados: ItemDelCarrito[] = [
      { productoId: "x", nombre: "X", precio: 100, cantidad: 3, paso: 1, minimo: 1 },
    ];
    const items = carritoReducer(
      carritoReducer([], { tipo: "agregar", producto: producto() }),
      { tipo: "cargar", items: guardados },
    );
    expect(items).toEqual(guardados);
  });
});
