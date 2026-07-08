// Sin imports a propósito: este módulo lo consumen el proxy, el panel y los
// scripts standalone de Node (que no resuelven los alias de TypeScript).

/** Subdominios que nunca pueden ser el slug de un comercio. */
export const SUBDOMINIOS_RESERVADOS = new Set(["www", "admin"]);

const PATRON_SLUG = /^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/;

/** Devuelve null si el slug es válido, o el motivo del rechazo. */
export function validarSlug(slug: string): string | null {
  if (!slug) return "El slug no puede estar vacío.";
  if (slug.length > 40) return "El slug no puede superar los 40 caracteres.";
  if (SUBDOMINIOS_RESERVADOS.has(slug)) return `"${slug}" es un subdominio reservado.`;
  if (!PATRON_SLUG.test(slug)) {
    return "El slug solo admite minúsculas, números y guiones (sin guiones al inicio o al final).";
  }
  return null;
}
