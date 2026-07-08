import type { Contacto, FranjaHoraria } from "@/core/types";

const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

function franjasPorDia(horarios: FranjaHoraria[]) {
  return DIAS.map((nombre, dia) => ({
    nombre,
    franjas: horarios
      .filter((franja) => franja.dia === dia)
      .sort((a, b) => a.apertura.localeCompare(b.apertura)),
  })).filter((diaConFranjas) => diaConFranjas.franjas.length > 0);
}

export function SeccionUbicacion({
  contacto,
  horarios,
}: {
  contacto: Contacto;
  horarios: FranjaHoraria[];
}) {
  return (
    <section className="border-t border-black/10 bg-black/[0.02] py-12">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 sm:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold">Dónde estamos</h2>
          <p className="opacity-80">{contacto.direccion}</p>
          <p className="opacity-80">{contacto.telefono}</p>
          <div>
            <h3 className="mb-2 font-semibold">Horarios</h3>
            <ul className="flex flex-col gap-1 text-sm opacity-80">
              {franjasPorDia(horarios).map(({ nombre, franjas }) => (
                <li key={nombre} className="flex justify-between gap-4">
                  <span>{nombre}</span>
                  <span>
                    {franjas.map((franja) => `${franja.apertura}–${franja.cierre}`).join(" · ")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <iframe
          title="Ubicación del comercio"
          src={`https://maps.google.com/maps?q=${contacto.mapLat},${contacto.mapLng}&z=15&output=embed`}
          className="h-72 w-full rounded-2xl border border-black/10"
          loading="lazy"
        />
      </div>
    </section>
  );
}
