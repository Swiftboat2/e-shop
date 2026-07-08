import { notFound } from "next/navigation";
import { obtenerComercio } from "@/features/comercio/datos";
import { Configuracion } from "@/features/panel/Configuracion";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ConfiguracionPage({ params }: Props) {
  const { slug } = await params;
  const comercio = await obtenerComercio(slug);
  if (!comercio) notFound();

  return <Configuracion slug={slug} comercio={comercio} />;
}
