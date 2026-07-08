import { describe, expect, it } from "vitest";
import { calcularDescuento, calcularResumenPrecio } from "@/core/dominio/descuentos";
import type { ConfigDescuentos } from "@/core/types";

const config = (parcial?: Partial<ConfigDescuentos>): ConfigDescuentos => ({
  activo: true,
  soloMetodosDePago: null,
  reglas: [
    { desdeCantidad: 10, descuentoPorcentaje: 10 },
    { desdeCantidad: 5, descuentoPorcentaje: 5 },
  ],
  ...parcial,
});

describe("calcularDescuento", () => {
  it("devuelve 0 sin configuración, desactivado o sin reglas", () => {
    expect(calcularDescuento(20, "efectivo", undefined)).toBe(0);
    expect(calcularDescuento(20, "efectivo", config({ activo: false }))).toBe(0);
    expect(calcularDescuento(20, "efectivo", config({ reglas: [] }))).toBe(0);
  });

  it("aplica la regla de mayor umbral alcanzado por la cantidad", () => {
    expect(calcularDescuento(12, "efectivo", config())).toBe(10);
    expect(calcularDescuento(7, "efectivo", config())).toBe(5);
    expect(calcularDescuento(3, "efectivo", config())).toBe(0);
  });

  it("incluye el umbral exacto", () => {
    expect(calcularDescuento(10, "efectivo", config())).toBe(10);
    expect(calcularDescuento(5, "efectivo", config())).toBe(5);
  });

  it("no depende del orden en que estén cargadas las reglas", () => {
    const desordenado = config({
      reglas: [
        { desdeCantidad: 5, descuentoPorcentaje: 5 },
        { desdeCantidad: 10, descuentoPorcentaje: 10 },
      ],
    });
    expect(calcularDescuento(12, "efectivo", desordenado)).toBe(10);
  });

  it("respeta la restricción por método de pago", () => {
    const soloEfectivo = config({ soloMetodosDePago: ["efectivo"] });
    expect(calcularDescuento(12, "transferencia", soloEfectivo)).toBe(0);
    expect(calcularDescuento(12, "efectivo", soloEfectivo)).toBe(10);
  });

  it("acepta cantidades fraccionadas", () => {
    expect(calcularDescuento(5.5, "efectivo", config())).toBe(5);
  });
});

describe("calcularResumenPrecio", () => {
  it("calcula subtotal, descuento y total", () => {
    const items = [
      { cantidad: 4, precio: 100 },
      { cantidad: 2, precio: 100 },
    ];
    expect(calcularResumenPrecio(items, "efectivo", config())).toEqual({
      subtotal: 600,
      descuentoPorcentaje: 5,
      descuentoMonto: 30,
      total: 570,
    });
  });

  it("sin descuento aplicable el total es el subtotal", () => {
    expect(calcularResumenPrecio([{ cantidad: 2, precio: 150 }], "efectivo", config())).toEqual({
      subtotal: 300,
      descuentoPorcentaje: 0,
      descuentoMonto: 0,
      total: 300,
    });
  });

  it("redondea los montos a 2 decimales", () => {
    expect(calcularResumenPrecio([{ cantidad: 6, precio: 33.33 }], "efectivo", config())).toEqual({
      subtotal: 199.98,
      descuentoPorcentaje: 5,
      descuentoMonto: 10,
      total: 189.98,
    });
  });

  it("con el carrito vacío devuelve todo en cero", () => {
    expect(calcularResumenPrecio([], "efectivo", config())).toEqual({
      subtotal: 0,
      descuentoPorcentaje: 0,
      descuentoMonto: 0,
      total: 0,
    });
  });
});
