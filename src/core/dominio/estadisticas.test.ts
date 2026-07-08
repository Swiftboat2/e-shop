import { describe, expect, it } from "vitest";
import { calcularEstadisticas } from "@/core/dominio/estadisticas";
import type { Pedido } from "@/core/types";

const TZ = "America/Argentina/Buenos_Aires";
// martes 7 de julio de 2026, 15:00 en Buenos Aires
const ahora = new Date("2026-07-07T15:00:00-03:00");

let secuencia = 0;
const pedido = (parcial: Partial<Pedido>): Pedido => ({
  id: `p${++secuencia}`,
  items: [],
  total: 1000,
  descuentoAplicado: 0,
  datosCliente: { nombre: "Cliente", metodoPago: "Efectivo" },
  estado: "aceptado",
  createdAt: new Date("2026-07-07T10:00:00-03:00"),
  numeroCorto: "P-TEST1",
  ...parcial,
});

describe("calcularEstadisticas", () => {
  it("solo lo aceptado cuenta como facturado, pero el desglose incluye todos los estados", () => {
    const estadisticas = calcularEstadisticas(
      [
        pedido({ estado: "aceptado", total: 1000 }),
        pedido({ estado: "pendiente", total: 500 }),
        pedido({ estado: "ignorado", total: 200 }),
      ],
      "todo",
      TZ,
      ahora,
    );

    expect(estadisticas.pedidosAceptados).toBe(1);
    expect(estadisticas.totalFacturado).toBe(1000);
    expect(estadisticas.porEstado).toEqual({ pendiente: 1, aceptado: 1, ignorado: 1 });
  });

  it("calcula el ticket promedio sobre los aceptados, redondeado a 2 decimales", () => {
    const estadisticas = calcularEstadisticas(
      [
        pedido({ total: 10 }),
        pedido({ total: 10 }),
        pedido({ total: 11 }),
      ],
      "todo",
      TZ,
      ahora,
    );
    expect(estadisticas.totalFacturado).toBe(31);
    expect(estadisticas.ticketPromedio).toBe(10.33);

    expect(calcularEstadisticas([], "todo", TZ, ahora).ticketPromedio).toBe(0);
  });

  it("suma los descuentos otorgados solo de pedidos aceptados", () => {
    const estadisticas = calcularEstadisticas(
      [
        pedido({ estado: "aceptado", descuentoAplicado: 100 }),
        pedido({ estado: "pendiente", descuentoAplicado: 50 }),
      ],
      "todo",
      TZ,
      ahora,
    );
    expect(estadisticas.descuentosOtorgados).toBe(100);
  });

  it('"hoy" filtra por el día local del comercio, no por UTC', () => {
    const pedidos = [
      // 22:30 del 7/7 en Buenos Aires, pero ya 8/7 en UTC
      pedido({ createdAt: new Date("2026-07-08T01:30:00Z") }),
      // ayer en Buenos Aires
      pedido({ createdAt: new Date("2026-07-06T23:00:00-03:00") }),
    ];

    expect(calcularEstadisticas(pedidos, "hoy", TZ, ahora).pedidosAceptados).toBe(1);
    expect(calcularEstadisticas(pedidos, "todo", TZ, ahora).pedidosAceptados).toBe(2);
  });

  it('"mes" filtra por el mes local del comercio', () => {
    const pedidos = [
      pedido({ createdAt: new Date("2026-07-01T10:00:00-03:00") }),
      // 1/7 a las 02:00 UTC = 30/6 a las 23:00 en Buenos Aires → mes anterior
      pedido({ createdAt: new Date("2026-07-01T02:00:00Z") }),
    ];

    expect(calcularEstadisticas(pedidos, "mes", TZ, ahora).pedidosAceptados).toBe(1);
  });
});
