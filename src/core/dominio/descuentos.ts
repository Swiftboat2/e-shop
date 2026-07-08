import type { ConfigDescuentos, ResumenPrecio } from "@/core/types";
import { redondearMoneda } from "./precio";

export interface ItemPrecio {
  cantidad: number;
  precio: number;
}

export function calcularDescuento(
  cantidadTotal: number,
  metodoPago: string,
  config?: ConfigDescuentos,
): number {
  if (!config?.activo || !config.reglas?.length) return 0;
  if (config.soloMetodosDePago && !config.soloMetodosDePago.includes(metodoPago)) return 0;

  const reglaAplicable = [...config.reglas]
    .sort((a, b) => b.desdeCantidad - a.desdeCantidad)
    .find((regla) => cantidadTotal >= regla.desdeCantidad);

  return reglaAplicable?.descuentoPorcentaje ?? 0;
}

export function calcularResumenPrecio(
  items: ItemPrecio[],
  metodoPago: string,
  config?: ConfigDescuentos,
): ResumenPrecio {
  const cantidadTotal = items.reduce((suma, item) => suma + item.cantidad, 0);
  const subtotal = redondearMoneda(
    items.reduce((suma, item) => suma + item.cantidad * item.precio, 0),
  );

  const descuentoPorcentaje = calcularDescuento(cantidadTotal, metodoPago, config);
  const descuentoMonto = redondearMoneda(subtotal * (descuentoPorcentaje / 100));

  return {
    subtotal,
    descuentoPorcentaje,
    descuentoMonto,
    total: redondearMoneda(subtotal - descuentoMonto),
  };
}
