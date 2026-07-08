/** Formato de moneda es-AR sin símbolo: 13500 → "13.500", 1500.5 → "1.500,5". */
export const formatearPrecio = (valor: number) =>
  valor.toLocaleString("es-AR", { maximumFractionDigits: 2 });

export const redondearMoneda = (monto: number) => Math.round(monto * 100) / 100;
