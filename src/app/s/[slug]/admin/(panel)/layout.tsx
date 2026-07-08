import { notFound, redirect } from "next/navigation";
import { obtenerComercio } from "@/features/comercio/datos";
import { ChromePanel } from "@/features/panel/ChromePanel";
import { GuardiaAdmin } from "@/features/panel/GuardiaAdmin";

interface Props {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function PanelLayout({ children, params }: Props) {
  const { slug } = await params;
  const comercio = await obtenerComercio(slug);
  if (!comercio) notFound();

  // El primer login va al wizard guiado, no al panel completo (spec 10.2).
  if (!comercio.onboardingCompletado) redirect("/admin/onboarding");

  return (
    <GuardiaAdmin slug={slug}>
      <ChromePanel nombreComercio={comercio.nombre} activo={comercio.activo}>
        {children}
      </ChromePanel>
    </GuardiaAdmin>
  );
}
