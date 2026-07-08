import { notFound } from "next/navigation";
import { obtenerComercio } from "@/features/comercio/datos";
import { GestionProductos } from "@/features/panel/GestionProductos";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductosPage({ params }: Props) {
  const { slug } = await params;
  const comercio = await obtenerComercio(slug);
  if (!comercio) notFound();

  return (
    <GestionProductos
      slug={slug}
      unidadesDeVenta={comercio.configuracion.unidadesDeVentaDisponibles}
    />
  );
}
