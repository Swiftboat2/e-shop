import { describe, expect, it } from "vitest";
import { cssVarsDelTema } from "./tema";
import type { Tema } from "@/core/types";

const temaBase: Tema = {
  colorPrimario: "#111111",
  colorSecundario: "#222222",
  colorFondo: "#ffffff",
  colorTexto: "#000000",
  fuente: "inter",
  radio: "redondeado",
  densidad: "compacta",
};

describe("cssVarsDelTema", () => {
  it("mapea radio y densidad a las variables CSS correspondientes", () => {
    const vars = cssVarsDelTema(temaBase) as Record<string, string>;
    expect(vars["--tema-radio"]).toBe("20px");
    expect(vars["--tema-espaciado-seccion"]).toBe("2.5rem");
    expect(vars["--tema-espaciado-grid"]).toBe("0.75rem");
  });

  it("usa 'suave' y 'confortable' como default cuando faltan en datos existentes", () => {
    const { radio: _radio, densidad: _densidad, ...sinCampos } = temaBase;
    const vars = cssVarsDelTema(sinCampos as Tema) as Record<string, string>;
    expect(vars["--tema-radio"]).toBe("12px");
    expect(vars["--tema-espaciado-seccion"]).toBe("4rem");
    expect(vars["--tema-espaciado-grid"]).toBe("1.25rem");
  });
});
