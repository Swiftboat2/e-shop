import type { CSSProperties } from "react";
import type { Tema } from "@/core/types";

// Set cerrado de fuentes: las variables las declara next/font en el layout raíz.
const FUENTES: Record<string, string> = {
  inter: "var(--font-inter)",
  poppins: "var(--font-poppins)",
  lora: "var(--font-lora)",
  outfit: "var(--font-outfit)",
  merriweather: "var(--font-merriweather)",
};

export function fuenteDelTema(fuente: string): string {
  return FUENTES[fuente] ?? "var(--font-geist-sans)";
}

const RADIOS: Record<Tema["radio"], string> = {
  recto: "0px",
  suave: "12px",
  redondeado: "20px",
};

const ESPACIADOS: Record<Tema["densidad"], { seccion: string; grid: string }> = {
  compacta: { seccion: "2.5rem", grid: "0.75rem" },
  confortable: { seccion: "4rem", grid: "1.25rem" },
};

/** Variables CSS del tema del comercio, inyectadas server-side para evitar
 * flash de colores por defecto. Los componentes las consumen vía Tailwind
 * (ej. bg-(--color-primario)), nunca con colores hardcodeados. */
export function cssVarsDelTema(tema: Tema): CSSProperties {
  const radio = RADIOS[tema.radio ?? "suave"];
  const espaciado = ESPACIADOS[tema.densidad ?? "confortable"];

  return {
    "--color-primario": tema.colorPrimario,
    "--color-secundario": tema.colorSecundario,
    "--color-fondo": tema.colorFondo,
    "--color-texto": tema.colorTexto,
    "--tema-radio": radio,
    "--tema-espaciado-seccion": espaciado.seccion,
    "--tema-espaciado-grid": espaciado.grid,
  } as CSSProperties;
}
