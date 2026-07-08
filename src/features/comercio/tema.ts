import type { CSSProperties } from "react";
import type { Tema } from "@/core/types";

// Set cerrado de fuentes: las variables las declara next/font en el layout raíz.
const FUENTES: Record<string, string> = {
  inter: "var(--font-inter)",
  poppins: "var(--font-poppins)",
  lora: "var(--font-lora)",
};

export function fuenteDelTema(fuente: string): string {
  return FUENTES[fuente] ?? "var(--font-geist-sans)";
}

/** Variables CSS del tema del comercio, inyectadas server-side para evitar
 * flash de colores por defecto. Los componentes las consumen vía Tailwind
 * (ej. bg-(--color-primario)), nunca con colores hardcodeados. */
export function cssVarsDelTema(tema: Tema): CSSProperties {
  return {
    "--color-primario": tema.colorPrimario,
    "--color-secundario": tema.colorSecundario,
    "--color-fondo": tema.colorFondo,
    "--color-texto": tema.colorTexto,
  } as CSSProperties;
}
