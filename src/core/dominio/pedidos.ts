import type { ItemCarrito, ItemPedido, Producto } from "@/core/types";
import { redondearMoneda } from "./precio";

export interface ItemPedidoCliente {
  productoId: string;
  cantidad: number;
}

export type ResultadoItemsPedido =
  | { ok: true; items: ItemPedido[]; itemsMensaje: ItemCarrito[] }
  | { ok: false; error: string };

/**
 * Reconstruye los items del pedido usando exclusivamente los datos de los
 * productos en la base: el cliente solo elige qué y cuánto — los precios
 * nunca viajan desde el navegador.
 */
export function armarItemsPedido(
  itemsCliente: ItemPedidoCliente[],
  productos: Map<string, Producto>,
): ResultadoItemsPedido {
  const items: ItemPedido[] = [];
  const itemsMensaje: ItemCarrito[] = [];

  for (const itemCliente of itemsCliente) {
    const producto = productos.get(itemCliente.productoId);
    if (!producto || !producto.disponible) {
      return { ok: false, error: "Un producto del carrito ya no está disponible." };
    }

    const { cantidad } = itemCliente;
    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      return { ok: false, error: "Hay una cantidad inválida en el carrito." };
    }

    const esFraccionado = producto.tipoVenta === "fraccionado";
    if (!esFraccionado && !Number.isInteger(cantidad)) {
      return { ok: false, error: `${producto.nombre} se vende por unidad entera.` };
    }

    const minimo = esFraccionado ? (producto.cantidadMinima ?? producto.pasoIncremento ?? 0) : 1;
    if (cantidad < minimo) {
      return { ok: false, error: `La cantidad mínima de ${producto.nombre} es ${minimo}.` };
    }

    items.push({
      productoId: producto.id,
      nombre: producto.nombre,
      cantidad,
      precioUnitario: producto.precio,
      subtotal: redondearMoneda(producto.precio * cantidad),
    });
    itemsMensaje.push({
      productoId: producto.id,
      nombre: producto.nombre,
      cantidad,
      precio: producto.precio,
      ...(esFraccionado && producto.unidadMedida ? { unidadMedida: producto.unidadMedida } : {}),
    });
  }

  if (items.length === 0) return { ok: false, error: "El carrito está vacío." };

  return { ok: true, items, itemsMensaje };
}
