export type EstadoPresupuesto = "borrador" | "enviado" | "aceptado" | "vencido";

export interface ItemPresupuesto {
  descripcion: string;
  cantidad: number;
  unidad?: string;
  precioUnitario: number;
  subtotal: number;
}

export interface DatosClientePresupuesto {
  nombre: string;
  telefono?: string;
  notas?: string;
}

export interface Presupuesto {
  id: string;
  numero: number;
  datosCliente: DatosClientePresupuesto;
  items: ItemPresupuesto[];
  subtotal: number;
  descuentoPorcentaje?: number;
  total: number;
  validezDias?: number;
  estado: EstadoPresupuesto;
  createdAt: Date;
}
