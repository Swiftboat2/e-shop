// Alfabeto sin caracteres ambiguos: 0/O, 1/I/L quedan afuera.
const ALFABETO = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const LARGO_SUFIJO = 5;

/**
 * Identificador corto legible para que el admin referencie un pedido.
 * Aleatorio en lugar de correlativo: evita un contador transaccional
 * en un path de escritura pública y concurrente.
 */
export function generarNumeroCorto(aleatorio: () => number = Math.random): string {
  let sufijo = "";
  for (let i = 0; i < LARGO_SUFIJO; i++) {
    sufijo += ALFABETO[Math.floor(aleatorio() * ALFABETO.length)];
  }
  return `P-${sufijo}`;
}
