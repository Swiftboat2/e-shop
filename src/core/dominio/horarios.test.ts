import { describe, expect, it } from "vitest";
import { calcularEstadoApertura } from "@/core/dominio/horarios";
import type { FranjaHoraria } from "@/core/types";

const TZ = "America/Argentina/Buenos_Aires";

// 2026-07-07 es martes (dia 2)
const martes = (hora: string) => new Date(`2026-07-07T${hora}:00-03:00`);

describe("calcularEstadoApertura", () => {
  const manianaYTarde: FranjaHoraria[] = [
    { dia: 2, apertura: "09:00", cierre: "13:00" },
    { dia: 2, apertura: "17:00", cierre: "21:00" },
  ];

  it("está abierto dentro de una franja", () => {
    const estado = calcularEstadoApertura(manianaYTarde, martes("10:30"), TZ);
    expect(estado).toEqual({ abierto: true, cierre: "13:00" });
  });

  it("está cerrado entre franjas y anuncia la próxima apertura de hoy", () => {
    const estado = calcularEstadoApertura(manianaYTarde, martes("14:00"), TZ);
    expect(estado.abierto).toBe(false);
    expect(estado.proximaApertura).toEqual({ dia: 2, hora: "17:00", enDias: 0 });
  });

  it("abre exactamente a la apertura y cierra exactamente al cierre", () => {
    expect(calcularEstadoApertura(manianaYTarde, martes("09:00"), TZ).abierto).toBe(true);
    expect(calcularEstadoApertura(manianaYTarde, martes("13:00"), TZ).abierto).toBe(false);
  });

  it("cuando no quedan franjas hoy, la próxima apertura cae en otro día", () => {
    const estado = calcularEstadoApertura(manianaYTarde, martes("22:00"), TZ);
    expect(estado.abierto).toBe(false);
    expect(estado.proximaApertura).toEqual({ dia: 2, hora: "09:00", enDias: 7 });
  });

  it("soporta franjas que cruzan la medianoche", () => {
    // ej. hamburguesería: viernes de 20:00 a 02:00
    const franjas: FranjaHoraria[] = [{ dia: 5, apertura: "20:00", cierre: "02:00" }];
    const viernesNoche = new Date("2026-07-10T23:59:00-03:00"); // 2026-07-10 es viernes
    const sabadoMadrugada = new Date("2026-07-11T01:30:00-03:00");
    const sabadoAlCierre = new Date("2026-07-11T02:00:00-03:00");

    expect(calcularEstadoApertura(franjas, viernesNoche, TZ)).toEqual({
      abierto: true,
      cierre: "02:00",
    });
    expect(calcularEstadoApertura(franjas, sabadoMadrugada, TZ)).toEqual({
      abierto: true,
      cierre: "02:00",
    });
    expect(calcularEstadoApertura(franjas, sabadoAlCierre, TZ).abierto).toBe(false);
  });

  it("calcula el día y la hora locales según la timezone del comercio", () => {
    // El mismo instante es martes 22:00 en Buenos Aires y miércoles 01:00 en UTC
    const instante = new Date("2026-07-08T01:00:00Z");
    const martesNoche: FranjaHoraria[] = [{ dia: 2, apertura: "18:00", cierre: "23:00" }];

    expect(calcularEstadoApertura(martesNoche, instante, TZ).abierto).toBe(true);
    expect(calcularEstadoApertura(martesNoche, instante, "UTC").abierto).toBe(false);
  });

  it("sin horarios configurados está siempre cerrado, sin próxima apertura", () => {
    expect(calcularEstadoApertura([], martes("10:00"), TZ)).toEqual({ abierto: false });
  });

  it("una franja con apertura igual al cierre representa abierto las 24 horas", () => {
    const todoElDia: FranjaHoraria[] = [{ dia: 2, apertura: "00:00", cierre: "00:00" }];
    expect(calcularEstadoApertura(todoElDia, martes("03:00"), TZ).abierto).toBe(true);
    expect(calcularEstadoApertura(todoElDia, martes("23:59"), TZ).abierto).toBe(true);
  });
});
