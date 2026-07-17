import type { CSSProperties } from "react";
import type { Tema } from "@/core/types";

// Combos tipográficos del set cerrado (ver opciones.ts): las variables las
// declara next/font en el layout raíz.
const COMBOS: Record<string, { display: string; texto: string }> = {
  grotesca: { display: "var(--font-space-grotesk)", texto: "var(--font-inter)" },
  calida: { display: "var(--font-bricolage)", texto: "var(--font-source-sans)" },
  geometrica: { display: "var(--font-outfit)", texto: "var(--font-karla)" },
  sobria: { display: "var(--font-chivo)", texto: "var(--font-work-sans)" },
};

// Ids de fuentes sueltas de la v1 del set, todavía guardados en Firestore:
// se remapean al combo más afín para no romper comercios existentes.
const COMBOS_LEGADO: Record<string, string> = {
  inter: "grotesca",
  poppins: "geometrica",
  lora: "calida",
};

export function comboDelTema(fuente: string): { display: string; texto: string } {
  return COMBOS[COMBOS_LEGADO[fuente] ?? fuente] ?? COMBOS.grotesca;
}

/** Luminancia relativa (WCAG) de un color hex, para decidir texto claro u
 * oscuro sobre el primario sin asumir que el primario es siempre oscuro. */
function luminancia(hex: string): number {
  const canal = (i: number) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * canal(1) + 0.7152 * canal(3) + 0.0722 * canal(5);
}

/** Variables CSS del tema del comercio, inyectadas server-side para evitar
 * flash de colores por defecto. Los componentes las consumen vía Tailwind
 * (ej. bg-(--color-primario)), nunca con colores hardcodeados.
 *
 * Además de los 4 colores elegidos se derivan:
 * - --color-borde: hairline que funciona sobre fondo claro u oscuro.
 * - --color-superficie: cards e inputs, un paso "elevado" sobre el fondo.
 * - --color-sobre-primario: texto sobre el primario (en paletas como
 *   "Nocturno" el primario es claro y el blanco fijo no contrasta).
 */
export function cssVarsDelTema(tema: Tema): CSSProperties {
  const combo = comboDelTema(tema.fuente);
  return {
    "--color-primario": tema.colorPrimario,
    "--color-secundario": tema.colorSecundario,
    "--color-fondo": tema.colorFondo,
    "--color-texto": tema.colorTexto,
    "--color-borde": `color-mix(in srgb, ${tema.colorTexto} 14%, transparent)`,
    "--color-superficie": `color-mix(in srgb, ${tema.colorFondo} 88%, #ffffff 12%)`,
    "--color-sobre-primario": luminancia(tema.colorPrimario) > 0.35 ? "#14161A" : "#FFFFFF",
    "--fuente-display": combo.display,
    "--fuente-texto": combo.texto,
  } as CSSProperties;
}
