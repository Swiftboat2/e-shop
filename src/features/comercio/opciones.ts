import type { Tema } from "@/core/types";

// Sets cerrados de personalización (spec sección 6): paletas y fuentes
// predefinidas — nada de color picker libre ni CSS custom.

export interface Paleta {
  id: string;
  nombre: string;
  colores: Omit<Tema, "fuente" | "radio" | "densidad">;
}

export const PALETAS: Paleta[] = [
  {
    id: "bosque",
    nombre: "Bosque",
    colores: { colorPrimario: "#15803d", colorSecundario: "#b45309", colorFondo: "#fafaf9", colorTexto: "#1c1917" },
  },
  {
    id: "oceano",
    nombre: "Océano",
    colores: { colorPrimario: "#0369a1", colorSecundario: "#c2410c", colorFondo: "#f8fafc", colorTexto: "#0f172a" },
  },
  {
    id: "uva",
    nombre: "Uva",
    colores: { colorPrimario: "#7c3aed", colorSecundario: "#db2777", colorFondo: "#fdfcff", colorTexto: "#1e1b4b" },
  },
  {
    id: "carbon",
    nombre: "Carbón",
    colores: { colorPrimario: "#18181b", colorSecundario: "#d97706", colorFondo: "#fafafa", colorTexto: "#18181b" },
  },
  {
    id: "terracota",
    nombre: "Terracota",
    colores: { colorPrimario: "#c2410c", colorSecundario: "#15803d", colorFondo: "#fdf8f3", colorTexto: "#292524" },
  },
  {
    id: "cerezo",
    nombre: "Cerezo",
    colores: { colorPrimario: "#be185d", colorSecundario: "#0d9488", colorFondo: "#fdf7f9", colorTexto: "#1c1917" },
  },
  {
    id: "cielo",
    nombre: "Cielo",
    colores: { colorPrimario: "#2563eb", colorSecundario: "#f59e0b", colorFondo: "#f5f8ff", colorTexto: "#1e293b" },
  },
  {
    id: "arena",
    nombre: "Arena",
    colores: { colorPrimario: "#a16207", colorSecundario: "#0f766e", colorFondo: "#fefaf3", colorTexto: "#3f3522" },
  },
  {
    id: "menta",
    nombre: "Menta",
    colores: { colorPrimario: "#059669", colorSecundario: "#7c3aed", colorFondo: "#f4fdf9", colorTexto: "#134e4a" },
  },
  {
    id: "medianoche",
    nombre: "Medianoche",
    colores: { colorPrimario: "#4f46e5", colorSecundario: "#e11d48", colorFondo: "#f5f5f7", colorTexto: "#111827" },
  },
];

export const FUENTES_DISPONIBLES = [
  { id: "inter", nombre: "Inter", descripcion: "moderna y neutra" },
  { id: "poppins", nombre: "Poppins", descripcion: "redondeada y amigable" },
  { id: "lora", nombre: "Lora", descripcion: "elegante, con serif" },
  { id: "outfit", nombre: "Outfit", descripcion: "geométrica y directa" },
  { id: "merriweather", nombre: "Merriweather", descripcion: "clásica, con serif marcado" },
];

export const ICONOS_FEATURES = [
  { id: "envio", nombre: "Envíos" },
  { id: "calidad", nombre: "Calidad" },
  { id: "atencion", nombre: "Atención" },
  { id: "pago", nombre: "Pagos" },
  { id: "check", nombre: "Tilde" },
];

export const RADIOS_DISPONIBLES: { id: Tema["radio"]; nombre: string }[] = [
  { id: "recto", nombre: "Recto" },
  { id: "suave", nombre: "Suave" },
  { id: "redondeado", nombre: "Redondeado" },
];

export const DENSIDADES_DISPONIBLES: { id: Tema["densidad"]; nombre: string }[] = [
  { id: "compacta", nombre: "Compacta" },
  { id: "confortable", nombre: "Confortable" },
];
