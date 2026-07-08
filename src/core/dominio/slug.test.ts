import { describe, expect, it } from "vitest";
import { SUBDOMINIOS_RESERVADOS, validarSlug } from "@/core/dominio/slug";

describe("validarSlug", () => {
  it("acepta slugs válidos de subdominio", () => {
    for (const slug of ["demo", "pizzeria-central", "kiosco24", "a", "x2"]) {
      expect(validarSlug(slug)).toBeNull();
    }
  });

  it("rechaza mayúsculas, espacios y caracteres fuera de [a-z0-9-]", () => {
    for (const slug of ["Pizzeria", "mi tienda", "café", "tienda_2", "ñandu"]) {
      expect(validarSlug(slug)).not.toBeNull();
    }
  });

  it("rechaza guiones al inicio o al final", () => {
    expect(validarSlug("-tienda")).not.toBeNull();
    expect(validarSlug("tienda-")).not.toBeNull();
  });

  it("rechaza vacío y largos mayores a 40", () => {
    expect(validarSlug("")).not.toBeNull();
    expect(validarSlug("a".repeat(41))).not.toBeNull();
    expect(validarSlug("a".repeat(40))).toBeNull();
  });

  it("rechaza los subdominios reservados", () => {
    for (const reservado of SUBDOMINIOS_RESERVADOS) {
      expect(validarSlug(reservado)).not.toBeNull();
    }
  });
});
