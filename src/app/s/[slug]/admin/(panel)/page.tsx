import { notFound } from "next/navigation";
import { obtenerComercio } from "@/features/comercio/datos";
import { Estadisticas } from "@/features/panel/Estadisticas";
import { EstadoPublicacion } from "@/features/panel/EstadoPublicacion";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function InicioPanelPage({ params }: Props) {
  const { slug } = await params;
  const comercio = await obtenerComercio(slug);
  if (!comercio) notFound();

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Hola, {comercio.nombre}</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        <EstadoPublicacion slug={slug} activoInicial={comercio.activo} />
        <div className="rounded-(--admin-radio-lg) border border-(--admin-borde) bg-(--admin-superficie) p-4">
          <p className="text-sm text-(--admin-texto-secundario)">Pedidos</p>
          <p className="mt-1 text-sm text-(--admin-texto-secundario)">
            Los pedidos nuevos aparecen en la sección Pedidos apenas llegan.
          </p>
        </div>
      </div>

      <Estadisticas slug={slug} timezone={comercio.timezone} />
    </section>
  );
}
