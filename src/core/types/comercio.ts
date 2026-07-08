export interface Tema {
  colorPrimario: string;
  colorSecundario: string;
  colorFondo: string;
  colorTexto: string;
  fuente: string;
}

export interface Contenido {
  heroTitulo: string;
  heroTituloDestacado: string;
  heroDescripcion: string;
  heroBadge: string;
}

export interface Feature {
  icono: string;
  texto: string;
}

export interface Contacto {
  telefono: string;
  direccion: string;
  mapLat: number;
  mapLng: number;
}

/**
 * dia: 0=domingo .. 6=sabado. Horas en formato "HH:MM".
 * Una franja con cierre menor a la apertura cruza la medianoche (ej. 20:00-02:00).
 * apertura igual a cierre representa abierto las 24 horas de ese día.
 */
export interface FranjaHoraria {
  dia: number;
  apertura: string;
  cierre: string;
}

export interface MetodoPago {
  id: string;
  nombre: string;
  activo: boolean;
}

export interface UnidadDeVenta {
  valor: string;
  etiqueta: string;
}

export interface ReglaDescuento {
  desdeCantidad: number;
  descuentoPorcentaje: number;
}

export interface ConfigDescuentos {
  activo: boolean;
  soloMetodosDePago: string[] | null;
  reglas: ReglaDescuento[];
}

export interface ConfiguracionComercio {
  metodosPago: MetodoPago[];
  unidadesDeVentaDisponibles: UnidadDeVenta[];
  descuentosPorVolumen: ConfigDescuentos;
}

export interface Comercio {
  slug: string;
  nombre: string;
  logoUrl: string;
  whatsappNumero: string;
  activo: boolean;
  onboardingCompletado: boolean;
  plan: string;
  timezone: string;
  /** Última numeración usada por el presupuestador (correlativo por comercio). */
  contadorPresupuestos?: number;
  createdAt: Date;
  tema: Tema;
  contenido: Contenido;
  features: Feature[];
  contacto: Contacto;
  horarios: FranjaHoraria[];
  configuracion: ConfiguracionComercio;
}

export interface AdminComercio {
  email: string;
  rol: "owner" | "editor";
  createdAt: Date;
}
