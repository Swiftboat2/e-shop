import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { obtenerComercio } from "@/features/comercio/datos";
import { FormularioLogin } from "@/features/panel/FormularioLogin";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const comercio = await obtenerComercio(slug);
  return { title: comercio ? `Ingresar · ${comercio.nombre}` : "Ingresar" };
}

export default async function LoginPage({ params }: Props) {
  const { slug } = await params;
  const comercio = await obtenerComercio(slug);
  if (!comercio) notFound();

  return (
    <main className="flex min-h-screen items-center justify-center bg-(--admin-bg) p-4 text-(--admin-texto)">
      <FormularioLogin slug={slug} nombreComercio={comercio.nombre} />
    </main>
  );
}
