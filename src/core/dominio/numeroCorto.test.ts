import { describe, expect, it } from "vitest";
import { generarNumeroCorto } from "@/core/dominio/numeroCorto";

describe("generarNumeroCorto", () => {
  it("genera el formato P-XXXXX sin caracteres ambiguos (0/O, 1/I/L)", () => {
    for (let i = 0; i < 100; i++) {
      expect(generarNumeroCorto()).toMatch(/^P-[2-9ABCDEFGHJKMNPQRSTUVWXYZ]{5}$/);
    }
  });

  it("es determinista con un generador inyectado", () => {
    expect(generarNumeroCorto(() => 0)).toBe("P-22222");
    expect(generarNumeroCorto(() => 0.9999999)).toBe("P-ZZZZZ");
  });
});
