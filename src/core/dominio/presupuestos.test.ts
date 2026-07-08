import { describe, expect, it } from "vitest";
import { calcularTotalesPresupuesto } from "@/core/dominio/presupuestos";

describe("calcularTotalesPresupuesto", () => {
  it("sin descuento, el total es el subtotal", () => {
    expect(
      calcularTotalesPresupuesto([
        { cantidad: 2, precioUnitario: 300 },
        { cantidad: 1, precioUnitario: 400 },
      ]),
    ).toEqual({ subtotal: 1000, descuentoMonto: 0, total: 1000 });
  });

  it("aplica el descuento porcentual sobre el subtotal", () => {
    expect(calcularTotalesPresupuesto([{ cantidad: 1, precioUnitario: 1000 }], 10)).toEqual({
      subtotal: 1000,
      descuentoMonto: 100,
      total: 900,
    });
  });

  it("redondea los montos a 2 decimales", () => {
    expect(calcularTotalesPresupuesto([{ cantidad: 3, precioUnitario: 33.33 }], 10)).toEqual({
      subtotal: 99.99,
      descuentoMonto: 10,
      total: 89.99,
    });
  });

  it("con items vacíos devuelve todo en cero", () => {
    expect(calcularTotalesPresupuesto([])).toEqual({ subtotal: 0, descuentoMonto: 0, total: 0 });
  });
});
