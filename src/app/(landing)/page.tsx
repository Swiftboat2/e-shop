import type { Metadata } from "next";
import { Landing } from "@/features/landing/Landing";
import { DESCRIPCION_PLATAFORMA, NOMBRE_PLATAFORMA } from "@/features/landing/marca";

export const metadata: Metadata = {
  title: `${NOMBRE_PLATAFORMA} — Tu catálogo online con pedidos por WhatsApp`,
  description: DESCRIPCION_PLATAFORMA,
  openGraph: {
    title: `${NOMBRE_PLATAFORMA} — Tu catálogo online con pedidos por WhatsApp`,
    description: DESCRIPCION_PLATAFORMA,
    type: "website",
  },
};

export default function LandingPage() {
  return <Landing />;
}
