import { notFound } from "next/navigation";
import { obtenerComercio } from "@/features/comercio/datos";

interface Props {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

// Valida la existencia del tenant para todo lo que viva bajo el subdominio.
// El gate de "en construcción" NO va acá: el dueño necesita entrar a /admin
// aunque su tienda siga con activo: false.
export default async function TenantLayout({ children, params }: Props) {
  const { slug } = await params;
  const comercio = await obtenerComercio(slug);
  if (!comercio) notFound();

  return children;
}
