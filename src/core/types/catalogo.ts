export type TipoVenta = "unidad" | "fraccionado";

export interface Categoria {
  id: string;
  nombre: string;
  orden: number;
  activo: boolean;
}

/** Reservado para una versión futura — sin UI de selección en la versión inicial. */
export interface Variante {
  nombre: string;
  opciones: string[];
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  imagenUrl: string;
  disponible: boolean;
  orden: number;
  categoriaId: string;
  codigoBarras?: string;
  tipoVenta: TipoVenta;
  precio: number;
  unidadMedida?: string;
  pasoIncremento?: number;
  cantidadMinima?: number;
  beneficios?: string[];
  variantes?: Variante[];
}
