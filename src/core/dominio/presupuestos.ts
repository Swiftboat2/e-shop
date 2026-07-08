import { redondearMoneda } from "./precio";

export interface ItemPresupuestable {
  cantidad: number;
  precioUnitario: number;
}

export interface TotalesPresupuesto {
  subtotal: number;
  descuentoMonto: number;
  total: number;
}

export function calcularTotalesPresupuesto(
  items: ItemPresupuestable[],
  descuentoPorcentaje = 0,
): TotalesPresupuesto {
  const subtotal = redondearMoneda(
    items.reduce((suma, item) => suma + item.cantidad * item.precioUnitario, 0),
  );
  const descuentoMonto = redondearMoneda(subtotal * (descuentoPorcentaje / 100));
  return { subtotal, descuentoMonto, total: redondearMoneda(subtotal - descuentoMonto) };
}
