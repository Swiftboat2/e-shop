import { describe, expect, it } from "vitest";
import { evaluarLimite } from "@/core/dominio/limitador";

describe("evaluarLimite", () => {
  const VENTANA = 10_000;
  const MAXIMO = 3;

  it("permite el primer intento sin estado previo", () => {
    const resultado = evaluarLimite(null, 1_000, VENTANA, MAXIMO);
    expect(resultado.permitido).toBe(true);
    expect(resultado.estado).toEqual({ ventanaInicio: 1_000, cantidad: 1 });
  });

  it("acumula intentos dentro de la misma ventana", () => {
    const primero = evaluarLimite(null, 0, VENTANA, MAXIMO);
    const segundo = evaluarLimite(primero.estado, 1_000, VENTANA, MAXIMO);
    expect(segundo.permitido).toBe(true);
    expect(segundo.estado).toEqual({ ventanaInicio: 0, cantidad: 2 });
  });

  it("bloquea al superar el máximo dentro de la ventana", () => {
    let estado = evaluarLimite(null, 0, VENTANA, MAXIMO).estado;
    estado = evaluarLimite(estado, 100, VENTANA, MAXIMO).estado; // 2
    estado = evaluarLimite(estado, 200, VENTANA, MAXIMO).estado; // 3, llega al máximo

    const cuarto = evaluarLimite(estado, 300, VENTANA, MAXIMO);
    expect(cuarto.permitido).toBe(false);
    expect(cuarto.estado).toEqual(estado);
  });

  it("resetea la ventana una vez que expira, incluso si estaba bloqueado", () => {
    let estado = evaluarLimite(null, 0, VENTANA, MAXIMO).estado;
    estado = evaluarLimite(estado, 100, VENTANA, MAXIMO).estado;
    estado = evaluarLimite(estado, 200, VENTANA, MAXIMO).estado;
    estado = evaluarLimite(estado, 300, VENTANA, MAXIMO).estado; // bloqueado, estado sin cambios

    const despuesDeLaVentana = evaluarLimite(estado, 0 + VENTANA, VENTANA, MAXIMO);
    expect(despuesDeLaVentana.permitido).toBe(true);
    expect(despuesDeLaVentana.estado).toEqual({ ventanaInicio: VENTANA, cantidad: 1 });
  });

  it("el límite exacto en el borde de la ventana ya cuenta como vencida", () => {
    const primero = evaluarLimite(null, 0, VENTANA, MAXIMO);
    const enElBorde = evaluarLimite(primero.estado, VENTANA, VENTANA, MAXIMO);
    expect(enElBorde.estado).toEqual({ ventanaInicio: VENTANA, cantidad: 1 });
  });
});
