import type { EstadoPedido, Pedido } from "@/core/types";
import { redondearMoneda } from "./precio";

export type Periodo = "hoy" | "mes" | "todo";

export interface Estadisticas {
  pedidosAceptados: number;
  totalFacturado: number;
  descuentosOtorgados: number;
  ticketPromedio: number;
  porEstado: Record<EstadoPedido, number>;
}

// en-CA da "YYYY-MM-DD": comparar claves de día/mes como strings evita
// aritmética de fechas y respeta la timezone del comercio.
const claveDia = (fecha: Date, timezone: string) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(fecha);

const claveMes = (fecha: Date, timezone: string) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
  }).format(fecha);

function perteneceAlPeriodo(fecha: Date, periodo: Periodo, timezone: string, ahora: Date): boolean {
  if (periodo === "todo") return true;
  if (periodo === "hoy") return claveDia(fecha, timezone) === claveDia(ahora, timezone);
  return claveMes(fecha, timezone) === claveMes(ahora, timezone);
}

export function calcularEstadisticas(
  pedidos: Pedido[],
  periodo: Periodo,
  timezone: string,
  ahora: Date = new Date(),
): Estadisticas {
  const delPeriodo = pedidos.filter((pedido) =>
    perteneceAlPeriodo(pedido.createdAt, periodo, timezone, ahora),
  );
  const aceptados = delPeriodo.filter((pedido) => pedido.estado === "aceptado");

  const totalFacturado = redondearMoneda(aceptados.reduce((suma, pedido) => suma + pedido.total, 0));
  const descuentosOtorgados = redondearMoneda(
    aceptados.reduce((suma, pedido) => suma + pedido.descuentoAplicado, 0),
  );

  return {
    pedidosAceptados: aceptados.length,
    totalFacturado,
    descuentosOtorgados,
    ticketPromedio: aceptados.length ? redondearMoneda(totalFacturado / aceptados.length) : 0,
    porEstado: {
      pendiente: delPeriodo.filter((pedido) => pedido.estado === "pendiente").length,
      aceptado: aceptados.length,
      ignorado: delPeriodo.filter((pedido) => pedido.estado === "ignorado").length,
    },
  };
}
