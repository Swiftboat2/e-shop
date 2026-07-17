import type { Tema } from "@/core/types";

// Sets cerrados de personalización: paletas y combinaciones tipográficas
// predefinidas — nada de color picker libre ni CSS custom. Las paletas están
// curadas para que dos comercios de la plataforma no se vean como la misma
// marca con logo cambiado.

export interface Paleta {
  id: string;
  nombre: string;
  descripcion: string;
  colores: Omit<Tema, "fuente">;
}

export const PALETAS: Paleta[] = [
  {
    id: "mercado",
    nombre: "Mercado",
    descripcion: "cálido y artesanal — almacenes, gastronomía",
    colores: { colorPrimario: "#C1440E", colorSecundario: "#2B4C3F", colorFondo: "#FAF7F2", colorTexto: "#2B2620" },
  },
  {
    id: "taller",
    nombre: "Taller",
    descripcion: "confiable y técnico — ferreterías, servicios",
    colores: { colorPrimario: "#1E5AA8", colorSecundario: "#E8A33D", colorFondo: "#F4F4F2", colorTexto: "#232527" },
  },
  {
    id: "nocturno",
    nombre: "Nocturno",
    descripcion: "premium y sobrio — indumentaria, gastronomía nocturna",
    colores: { colorPrimario: "#7FB8A0", colorSecundario: "#D9C08A", colorFondo: "#14161A", colorTexto: "#EDEDEA" },
  },
  {
    id: "fresco",
    nombre: "Fresco",
    descripcion: "directo y energético — kioscos, delivery rápido",
    colores: { colorPrimario: "#0891B2", colorSecundario: "#F97316", colorFondo: "#FFFFFF", colorTexto: "#1A1A1A" },
  },
  {
    id: "ceramica",
    nombre: "Cerámica",
    descripcion: "hecho a mano — panaderías, productos artesanales",
    colores: { colorPrimario: "#8B4049", colorSecundario: "#6B7D5C", colorFondo: "#F2EDE4", colorTexto: "#2E2620" },
  },
];

// El comercio no elige fuentes sueltas (riesgo de romper jerarquía): elige una
// combinación ya pareada de display (nombres de producto, precios, títulos) +
// texto (descripciones, labels, UI).
export interface ComboTipografico {
  id: string;
  nombre: string;
  display: string;
  texto: string;
  descripcion: string;
}

export const COMBOS_TIPOGRAFICOS: ComboTipografico[] = [
  {
    id: "grotesca",
    nombre: "Grotesca",
    display: "Space Grotesk",
    texto: "Inter",
    descripcion: "precisa y actual",
  },
  {
    id: "calida",
    nombre: "Cálida",
    display: "Bricolage Grotesque",
    texto: "Source Sans 3",
    descripcion: "con carácter, artesanal",
  },
  {
    id: "geometrica",
    nombre: "Geométrica",
    display: "Outfit",
    texto: "Karla",
    descripcion: "limpia y contemporánea",
  },
  {
    id: "sobria",
    nombre: "Sobria",
    display: "Chivo",
    texto: "Work Sans",
    descripcion: "seria, sin frialdad",
  },
];

export const ICONOS_FEATURES = [
  { id: "envio", nombre: "Envíos" },
  { id: "calidad", nombre: "Calidad" },
  { id: "atencion", nombre: "Atención" },
  { id: "pago", nombre: "Pagos" },
  { id: "check", nombre: "Tilde" },
];
