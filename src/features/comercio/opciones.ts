import type { Tema } from "@/core/types";

// Sets cerrados de personalización (spec sección 6): paletas y fuentes
// predefinidas — nada de color picker libre ni CSS custom.

export interface Paleta {
  id: string;
  nombre: string;
  colores: Omit<Tema, "fuente">;
}

export const PALETAS: Paleta[] = [
  {
    id: "bosque",
    nombre: "Bosque",
    colores: { colorPrimario: "#15803d", colorSecundario: "#b45309", colorFondo: "#fafaf9", colorTexto: "#1c1917", radio: "suave", densidad: "confortable" },
  },
  {
    id: "oceano",
    nombre: "Océano",
    colores: { colorPrimario: "#0369a1", colorSecundario: "#c2410c", colorFondo: "#f8fafc", colorTexto: "#0f172a", radio: "suave", densidad: "confortable" },
  },
  {
    id: "uva",
    nombre: "Uva",
    colores: { colorPrimario: "#7c3aed", colorSecundario: "#db2777", colorFondo: "#fdfcff", colorTexto: "#1e1b4b", radio: "suave", densidad: "confortable" },
  },
  {
    id: "carbon",
    nombre: "Carbón",
    colores: { colorPrimario: "#18181b", colorSecundario: "#d97706", colorFondo: "#fafafa", colorTexto: "#18181b", radio: "suave", densidad: "confortable" },
  },
  {
    id: "terracota",
    nombre: "Terracota",
    colores: { colorPrimario: "#c2410c", colorSecundario: "#15803d", colorFondo: "#fdf8f3", colorTexto: "#292524", radio: "suave", densidad: "confortable" },
  },
  {
    id: "cerezo",
    nombre: "Cerezo",
    colores: { colorPrimario: "#be185d", colorSecundario: "#0d9488", colorFondo: "#fdf7f9", colorTexto: "#1c1917", radio: "suave", densidad: "confortable" },
  },
];

export const FUENTES_DISPONIBLES = [
  { id: "inter", nombre: "Inter", descripcion: "moderna y neutra" },
  { id: "poppins", nombre: "Poppins", descripcion: "redondeada y amigable" },
  { id: "lora", nombre: "Lora", descripcion: "elegante, con serif" },
];

export const ICONOS_FEATURES = [
  { id: "envio", nombre: "Envíos" },
  { id: "calidad", nombre: "Calidad" },
  { id: "atencion", nombre: "Atención" },
  { id: "pago", nombre: "Pagos" },
  { id: "check", nombre: "Tilde" },
];
