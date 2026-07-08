// Identidad de la plataforma (no de ningún tenant). El nombre es un
// placeholder: cambiarlo acá lo cambia en toda la landing y el OG image.
export const NOMBRE_PLATAFORMA = "Pedime";

export const DESCRIPCION_PLATAFORMA =
  "Tu catálogo online con tu marca, en tu propia dirección web, donde tus clientes arman el pedido y te lo mandan por WhatsApp.";

// TODO: reemplazar por el WhatsApp real de contacto de la plataforma.
const WHATSAPP_PLATAFORMA = process.env.NEXT_PUBLIC_WHATSAPP_CONTACTO ?? "5490000000000";

export const LINK_WHATSAPP_CONTACTO = `https://wa.me/${WHATSAPP_PLATAFORMA}?text=${encodeURIComponent(
  "Hola! Quiero saber más sobre la plataforma de catálogos con pedidos por WhatsApp.",
)}`;

export function urlDemo(): string {
  const dominio = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000";
  const protocolo = dominio.includes("localhost") ? "http" : "https";
  return `${protocolo}://demo.${dominio}`;
}
