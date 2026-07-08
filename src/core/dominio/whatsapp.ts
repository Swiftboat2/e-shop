import type { DatosCliente, ItemCarrito, ResumenPrecio } from "@/core/types";
import { formatearPrecio as formatear } from "./precio";

/**
 * Arma el link wa.me con el pedido formateado en texto plano, sin emojis,
 * listo para que el cliente lo envíe al número del comercio.
 */
export function generarLinkWhatsApp(
  numeroComercio: string,
  items: ItemCarrito[],
  cliente: DatosCliente,
  resumen: ResumenPrecio,
): string {
  const lineasProductos = items
    .map((item) => {
      const etiquetaCantidad = item.unidadMedida
        ? `${formatear(item.cantidad)}${item.unidadMedida}`
        : `${formatear(item.cantidad)}x`;
      return `${etiquetaCantidad} ${item.nombre} - $${formatear(item.precio * item.cantidad)}`;
    })
    .join("\n");

  // Con descuento se desglosa el detalle: un total ya rebajado sin contexto
  // genera desconfianza en el cliente y en el comercio que lo recibe.
  const lineasTotal =
    resumen.descuentoPorcentaje > 0
      ? [
          `Subtotal: $${formatear(resumen.subtotal)}`,
          `Descuento por volumen (${resumen.descuentoPorcentaje}%): -$${formatear(resumen.descuentoMonto)}`,
          `Total Final: $${formatear(resumen.total)}`,
        ]
      : [`Total: $${formatear(resumen.total)}`];

  // Las líneas condicionales ausentes se marcan con null: los strings vacíos
  // son separadores intencionales del mensaje y deben conservarse.
  const mensaje = [
    "PEDIDO NUEVO",
    "",
    lineasProductos,
    "",
    ...lineasTotal,
    "",
    `Nombre: ${cliente.nombre}`,
    `Metodo de pago: ${cliente.metodoPago}`,
    cliente.direccion ? `Direccion de envio: ${cliente.direccion}` : null,
    cliente.notas ? `Notas: ${cliente.notas}` : null,
  ]
    .filter((linea): linea is string => linea !== null)
    .join("\n");

  const numeroLimpio = numeroComercio.replace(/\D/g, "");
  return `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensaje)}`;
}
