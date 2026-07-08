import type { ItemCarrito, Producto } from "@/core/types";

/** Item del carrito enriquecido con las reglas de incremento del producto,
 * para poder operar +/- sin volver a consultar el catálogo. */
export interface ItemDelCarrito extends ItemCarrito {
  paso: number;
  minimo: number;
}

export type AccionCarrito =
  | { tipo: "cargar"; items: ItemDelCarrito[] }
  | { tipo: "agregar"; producto: Producto }
  | { tipo: "incrementar"; productoId: string }
  | { tipo: "quitar"; productoId: string }
  | { tipo: "eliminar"; productoId: string }
  | { tipo: "vaciar" };

// Evita arrastre de flotantes al acumular pasos como 0.25 o 0.5.
const redondearCantidad = (cantidad: number) => Math.round(cantidad * 1000) / 1000;

function itemDesdeProducto(producto: Producto): ItemDelCarrito {
  const esFraccionado = producto.tipoVenta === "fraccionado";
  const paso = esFraccionado ? (producto.pasoIncremento ?? 1) : 1;
  const minimo = esFraccionado ? (producto.cantidadMinima ?? paso) : 1;

  return {
    productoId: producto.id,
    nombre: producto.nombre,
    precio: producto.precio,
    cantidad: minimo,
    ...(esFraccionado && producto.unidadMedida ? { unidadMedida: producto.unidadMedida } : {}),
    paso,
    minimo,
  };
}

function conCantidad(items: ItemDelCarrito[], productoId: string, cantidad: number) {
  return items.map((item) => (item.productoId === productoId ? { ...item, cantidad } : item));
}

export function carritoReducer(
  items: ItemDelCarrito[],
  accion: AccionCarrito,
): ItemDelCarrito[] {
  switch (accion.tipo) {
    case "cargar":
      return accion.items;

    case "agregar": {
      const existente = items.find((item) => item.productoId === accion.producto.id);
      if (!existente) return [...items, itemDesdeProducto(accion.producto)];
      return conCantidad(
        items,
        existente.productoId,
        redondearCantidad(existente.cantidad + existente.paso),
      );
    }

    case "incrementar": {
      const existente = items.find((item) => item.productoId === accion.productoId);
      if (!existente) return items;
      return conCantidad(
        items,
        existente.productoId,
        redondearCantidad(existente.cantidad + existente.paso),
      );
    }

    case "quitar": {
      const existente = items.find((item) => item.productoId === accion.productoId);
      if (!existente) return items;

      const cantidad = redondearCantidad(existente.cantidad - existente.paso);
      if (cantidad < existente.minimo) {
        return items.filter((item) => item.productoId !== accion.productoId);
      }
      return conCantidad(items, existente.productoId, cantidad);
    }

    case "eliminar":
      return items.filter((item) => item.productoId !== accion.productoId);

    case "vaciar":
      return [];
  }
}
