import { notFound } from "next/navigation";
import { obtenerComercio } from "@/features/comercio/datos";
import { GestionPresupuestos } from "@/features/panel/GestionPresupuestos";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PresupuestosPage({ params }: Props) {
  const { slug } = await params;
  const comercio = await obtenerComercio(slug);
  if (!comercio) notFound();

  return (
    <GestionPresupuestos
      slug={slug}
      comercio={{
        nombre: comercio.nombre,
        whatsappNumero: comercio.whatsappNumero,
        contacto: comercio.contacto,
      }}
    />
  );
}
