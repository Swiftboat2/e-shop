import { NextRequest, NextResponse } from "next/server";
import { SUBDOMINIOS_RESERVADOS } from "@/core/dominio/slug";

const DOMINIO_RAIZ = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000";

export function proxy(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").toLowerCase();
  const { pathname } = req.nextUrl;

  // /s/... es el destino interno del rewrite por subdominio:
  // no se navega directo desde el dominio raíz.
  if (pathname === "/s" || pathname.startsWith("/s/")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const esSubdominioDelRaiz = host.endsWith(`.${DOMINIO_RAIZ}`);
  if (!esSubdominioDelRaiz) return NextResponse.next();

  const slug = host.slice(0, -(DOMINIO_RAIZ.length + 1));
  if (slug === "" || slug.includes(".") || SUBDOMINIOS_RESERVADOS.has(slug)) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = pathname === "/" ? `/s/${slug}` : `/s/${slug}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon\\.ico|.*\\..*).*)"],
};
