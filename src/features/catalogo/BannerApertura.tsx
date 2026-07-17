import { calcularEstadoApertura, type ProximaApertura } from "@/core/dominio/horarios";
import type { FranjaHoraria } from "@/core/types";

const DIAS = ["el domingo", "el lunes", "el martes", "el miércoles", "el jueves", "el viernes", "el sábado"];

function etiquetaProxima(proxima: ProximaApertura): string {
  const cuando = proxima.enDias === 0 ? "hoy" : proxima.enDias === 1 ? "mañana" : DIAS[proxima.dia];
  return `Cerrado ahora · abre ${cuando} a las ${proxima.hora}`;
}

export function BannerApertura({ horarios, timezone }: { horarios: FranjaHoraria[]; timezone: string }) {
  if (horarios.length === 0) return null;

  const estado = calcularEstadoApertura(horarios, new Date(), timezone);

  if (estado.abierto) {
    return (
      <div className="bg-(--color-primario)/10 px-4 py-2 text-center text-sm font-medium text-(--color-primario)">
        Abierto ahora · cierra a las {estado.cierre}
      </div>
    );
  }

  return (
    <div className="bg-(--color-texto)/5 px-4 py-2 text-center text-sm font-medium opacity-80">
      {estado.proximaApertura ? etiquetaProxima(estado.proximaApertura) : "Cerrado por ahora"}
    </div>
  );
}
