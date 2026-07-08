import type { FranjaHoraria } from "@/core/types";

export interface ProximaApertura {
  dia: number;
  hora: string;
  /** 0 = hoy, 1 = mañana, ... 7 = mismo día de la semana que viene */
  enDias: number;
}

export interface EstadoApertura {
  abierto: boolean;
  cierre?: string;
  proximaApertura?: ProximaApertura;
}

const DIAS_SEMANA = 7;

const DIA_POR_NOMBRE: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

function aMinutos(hhmm: string): number {
  const [horas, minutos] = hhmm.split(":").map(Number);
  return horas * 60 + minutos;
}

function momentoLocal(ahora: Date, timezone: string): { dia: number; minutos: number } {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(ahora);

  const valor = (tipo: Intl.DateTimeFormatPartTypes) =>
    partes.find((parte) => parte.type === tipo)?.value ?? "";

  return {
    dia: DIA_POR_NOMBRE[valor("weekday")],
    minutos: Number(valor("hour")) * 60 + Number(valor("minute")),
  };
}

// cierre < apertura cruza la medianoche; apertura === cierre cubre las 24 horas.
function cubre(franja: FranjaHoraria, dia: number, minutos: number): boolean {
  const inicio = aMinutos(franja.apertura);
  const fin = aMinutos(franja.cierre);

  if (inicio === fin) return franja.dia === dia;
  if (inicio < fin) return franja.dia === dia && minutos >= inicio && minutos < fin;

  const enTramoNocturno = franja.dia === dia && minutos >= inicio;
  const enTramoMadrugada = (franja.dia + 1) % DIAS_SEMANA === dia && minutos < fin;
  return enTramoNocturno || enTramoMadrugada;
}

function buscarProximaApertura(
  horarios: FranjaHoraria[],
  dia: number,
  minutos: number,
): ProximaApertura | undefined {
  for (let enDias = 0; enDias <= DIAS_SEMANA; enDias++) {
    const diaCandidato = (dia + enDias) % DIAS_SEMANA;
    const aperturas = horarios
      .filter((franja) => franja.dia === diaCandidato)
      .sort((a, b) => aMinutos(a.apertura) - aMinutos(b.apertura));

    const siguiente = aperturas.find((franja) => enDias > 0 || aMinutos(franja.apertura) > minutos);
    if (siguiente) return { dia: diaCandidato, hora: siguiente.apertura, enDias };
  }
  return undefined;
}

/**
 * Calcula si el comercio está abierto en este instante según sus franjas
 * horarias, evaluadas en la timezone del propio comercio.
 */
export function calcularEstadoApertura(
  horarios: FranjaHoraria[],
  ahora: Date,
  timezone: string,
): EstadoApertura {
  const { dia, minutos } = momentoLocal(ahora, timezone);

  const franjaActual = horarios.find((franja) => cubre(franja, dia, minutos));
  if (franjaActual) return { abierto: true, cierre: franjaActual.cierre };

  const proxima = buscarProximaApertura(horarios, dia, minutos);
  return proxima ? { abierto: false, proximaApertura: proxima } : { abierto: false };
}
