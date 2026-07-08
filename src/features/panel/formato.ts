const FORMATO_FECHA = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** "07/07, 14:30" — corto, para listados del panel. */
export function formatearFechaCorta(fecha: Date): string {
  return FORMATO_FECHA.format(fecha);
}

/** "#0004" — numeración correlativa del presupuestador. */
export function formatearNumeroPresupuesto(numero: number): string {
  return `#${String(numero).padStart(4, "0")}`;
}
