import { describe, expect, it } from "vitest";
import { armarItemsPedido } from "@/core/dominio/pedidos";
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

const enBase = (...lista: Producto[]) => new Map(lista.map((p) => [p.id, p]));

describe("armarItemsPedido", () => {
  it("reconstruye los items con los precios de la base, nunca del cliente", () => {
    const resultado = armarItemsPedido([{ productoId: "p1", cantidad: 2 }], enBase(producto()));

    expect(resultado).toEqual({
      ok: true,
      items: [
        {
          productoId: "p1",
          nombre: "Yerba Mate Orgánica 1kg",
          cantidad: 2,
          precioUnitario: 8500,
          subtotal: 17000,
        },
      ],
      itemsMensaje: [
        { productoId: "p1", nombre: "Yerba Mate Orgánica 1kg", cantidad: 2, precio: 8500 },
      ],
    });
  });

  it("incluye la unidad de medida en los items del mensaje para fraccionados", () => {
    const almendras = producto({
      id: "alm",
      nombre: "Almendras",
      tipoVenta: "fraccionado",
      precio: 28000,
      unidadMedida: "kg",
      pasoIncremento: 0.25,
      cantidadMinima: 0.25,
    });
    const resultado = armarItemsPedido([{ productoId: "alm", cantidad: 0.75 }], enBase(almendras));

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;
    expect(resultado.itemsMensaje[0]).toEqual({
      productoId: "alm",
      nombre: "Almendras",
      cantidad: 0.75,
      precio: 28000,
      unidadMedida: "kg",
    });
    expect(resultado.items[0].subtotal).toBe(21000);
  });

  it("rechaza el carrito vacío", () => {
    expect(armarItemsPedido([], enBase(producto()))).toEqual({
      ok: false,
      error: "El carrito está vacío.",
    });
  });

  it("rechaza productos inexistentes o no disponibles", () => {
    expect(armarItemsPedido([{ productoId: "nope", cantidad: 1 }], enBase(producto())).ok).toBe(false);
    expect(
      armarItemsPedido(
        [{ productoId: "p1", cantidad: 1 }],
        enBase(producto({ disponible: false })),
      ).ok,
    ).toBe(false);
  });

  it("rechaza cantidades inválidas", () => {
    for (const cantidad of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(armarItemsPedido([{ productoId: "p1", cantidad }], enBase(producto())).ok).toBe(false);
    }
  });

  it("rechaza cantidades no enteras en la venta por unidad", () => {
    const resultado = armarItemsPedido([{ productoId: "p1", cantidad: 1.5 }], enBase(producto()));
    expect(resultado).toEqual({
      ok: false,
      error: "Yerba Mate Orgánica 1kg se vende por unidad entera.",
    });
  });

  it("rechaza cantidades bajo el mínimo del fraccionado y acepta el mínimo exacto", () => {
    const granel = producto({
      id: "gr",
      nombre: "Detergente",
      tipoVenta: "fraccionado",
      precio: 3800,
      unidadMedida: "litro",
      pasoIncremento: 0.5,
      cantidadMinima: 1,
    });

    expect(armarItemsPedido([{ productoId: "gr", cantidad: 0.5 }], enBase(granel))).toEqual({
      ok: false,
      error: "La cantidad mínima de Detergente es 1.",
    });
    expect(armarItemsPedido([{ productoId: "gr", cantidad: 1 }], enBase(granel)).ok).toBe(true);
  });
});
