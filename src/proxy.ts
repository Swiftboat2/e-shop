import { NextRequest, NextResponse } from "next/server";
import { SUBDOMINIOS_RESERVADOS } from "@/core/dominio/slug";

const DOMINIO_RAIZ = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000";

export function proxy(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").toLowerCase();
  const { pathname } = req.nextUrl;

  const esSubdominioDelRaiz = host.endsWith(`.${DOMINIO_RAIZ}`);
  const slug = esSubdominioDelRaiz ? host.slice(0, -(DOMINIO_RAIZ.length + 1)) : "";
  const esSlugValido = slug !== "" && !slug.includes(".") && !SUBDOMINIOS_RESERVADOS.has(slug);

  // /s/... es el destino interno del rewrite por subdominio. Next lo usa tal
  // cual (sin re-mapear) al resolver URLs absolutas de metadata generada por
  // archivo (ej. opengraph-image): en el propio subdominio del tenant hay
  // que dejarlo pasar, no mandarlo a home. Solo se bloquea la navegación
  // directa a /s/* desde un host que no sea el subdominio de ese mismo slug.
  if (pathname === "/s" || pathname.startsWith("/s/")) {
    if (esSlugValido && pathname.startsWith(`/s/${slug}`)) return NextResponse.next();
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (!esSlugValido) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = pathname === "/" ? `/s/${slug}` : `/s/${slug}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon\\.ico|.*\\..*).*)"],
};
