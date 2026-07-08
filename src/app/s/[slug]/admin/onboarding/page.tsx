import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { obtenerComercio } from "@/features/comercio/datos";
import { GuardiaAdmin } from "@/features/panel/GuardiaAdmin";
import { Onboarding } from "@/features/panel/Onboarding";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const comercio = await obtenerComercio(slug);
  return { title: comercio ? `Configuración inicial · ${comercio.nombre}` : "Configuración inicial" };
}

export default async function OnboardingPage({ params }: Props) {
  const { slug } = await params;
  const comercio = await obtenerComercio(slug);
  if (!comercio) notFound();
  if (comercio.onboardingCompletado) redirect("/admin");

  return (
    <GuardiaAdmin slug={slug}>
      <Onboarding slug={slug} comercio={comercio} />
    </GuardiaAdmin>
  );
}
