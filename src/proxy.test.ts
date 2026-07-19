import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { proxy } from "./proxy";

// NextRequest no completa el header Host desde la URL (a diferencia de un
// request real): hay que pasarlo explícito para que el proxy lo lea.
const pedido = (host: string, path = "/") =>
  new NextRequest(`http://${host}${path}`, { headers: { host } });

describe("proxy", () => {
  it("no reescribe el dominio raíz", () => {
    const respuesta = proxy(pedido("localhost:3000", "/"));
    expect(respuesta.headers.get("x-middleware-rewrite")).toBeNull();
    expect(respuesta.status).not.toBe(307);
  });

  it("reescribe la home de un subdominio de comercio a /s/{slug}", () => {
    const respuesta = proxy(pedido("demo.localhost:3000", "/"));
    const destino = respuesta.headers.get("x-middleware-rewrite");
    expect(destino).toBe("http://demo.localhost:3000/s/demo");
  });

  it("reescribe una subruta del subdominio preservando el path", () => {
    const respuesta = proxy(pedido("demo.localhost:3000", "/admin"));
    const destino = respuesta.headers.get("x-middleware-rewrite");
    expect(destino).toBe("http://demo.localhost:3000/s/demo/admin");
  });

  it("no rewritea subdominios reservados (ej. www)", () => {
    const respuesta = proxy(pedido("www.localhost:3000", "/"));
    expect(respuesta.headers.get("x-middleware-rewrite")).toBeNull();
  });

  // Next resuelve las URLs absolutas de metadata generada por archivo (ej.
  // opengraph-image) usando el pathname interno /s/{slug}/... tal cual: en
  // el propio subdominio del tenant esa ruta tiene que dejarse pasar.
  it("deja pasar /s/{slug}/... cuando el host es el subdominio de ese mismo slug", () => {
    const respuesta = proxy(pedido("demo.localhost:3000", "/s/demo/opengraph-image-abc123"));
    expect(respuesta.headers.get("x-middleware-rewrite")).toBeNull();
    expect(respuesta.status).not.toBe(307);
  });

  it("redirige a home un acceso directo a /s/* desde el dominio raíz", () => {
    const respuesta = proxy(pedido("localhost:3000", "/s/demo"));
    expect(respuesta.status).toBe(307);
    expect(respuesta.headers.get("location")).toBe("http://localhost:3000/");
  });

  it("redirige a home un acceso a /s/{otro-slug} desde el subdominio de otro comercio", () => {
    const respuesta = proxy(
      pedido("demo.localhost:3000", "/s/otro-comercio/opengraph-image-abc123"),
    );
    expect(respuesta.status).toBe(307);
    expect(respuesta.headers.get("location")).toBe("http://demo.localhost:3000/");
  });
});
