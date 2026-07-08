export type EstadoPedido = "pendiente" | "aceptado" | "ignorado";

export interface ItemPedido {
  productoId: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface DatosCliente {
  nombre: string;
  metodoPago: string;
  direccion?: string;
  notas?: string;
}

export interface Pedido {
  id: string;
  items: ItemPedido[];
  total: number;
  descuentoAplicado: number;
  datosCliente: DatosCliente;
  estado: EstadoPedido;
  createdAt: Date;
  numeroCorto: string;
}

export interface ItemCarrito {
  productoId: string;
  nombre: string;
  cantidad: number;
  unidadMedida?: string;
  precio: number;
}

export interface ResumenPrecio {
  subtotal: number;
  descuentoPorcentaje: number;
  descuentoMonto: number;
  total: number;
}
