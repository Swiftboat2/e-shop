/** Ventana deslizante fija: N intentos permitidos cada X ms por clave. */
export interface EstadoLimite {
  ventanaInicio: number;
  cantidad: number;
}

export interface ResultadoLimite {
  permitido: boolean;
  estado: EstadoLimite;
}

export const VENTANA_LIMITE_PEDIDOS_MS = 10 * 60 * 1000;
export const MAXIMO_PEDIDOS_POR_VENTANA = 3;

/**
 * Decide si un nuevo intento entra dentro del límite, dado el estado
 * guardado del intento anterior (o null si es la primera vez). Pura: la
 * orquestación con Firestore (leer/escribir el estado en una transacción)
 * vive en features/pedidos/acciones.ts.
 */
export function evaluarLimite(
  estadoPrevio: EstadoLimite | null,
  ahora: number,
  ventanaMs: number = VENTANA_LIMITE_PEDIDOS_MS,
  maximo: number = MAXIMO_PEDIDOS_POR_VENTANA,
): ResultadoLimite {
  const ventanaVencida = !estadoPrevio || ahora - estadoPrevio.ventanaInicio >= ventanaMs;
  if (ventanaVencida) {
    return { permitido: true, estado: { ventanaInicio: ahora, cantidad: 1 } };
  }
  if (estadoPrevio.cantidad < maximo) {
    return { permitido: true, estado: { ...estadoPrevio, cantidad: estadoPrevio.cantidad + 1 } };
  }
  return { permitido: false, estado: estadoPrevio };
}
