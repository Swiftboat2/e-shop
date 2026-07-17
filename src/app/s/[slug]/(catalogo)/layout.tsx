import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CarritoProvider } from "@/features/carrito/CarritoContext";
import { PanelCarrito } from "@/features/carrito/PanelCarrito";
import { EnConstruccion } from "@/features/comercio/EnConstruccion";
import { obtenerComercio } from "@/features/comercio/datos";
import { cssVarsDelTema } from "@/features/comercio/tema";

interface Props {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { slug } = await params;
  const comercio = await obtenerComercio(slug);
  if (!comercio?.activo) return { title: comercio?.nombre };

  return { title: comercio.nombre, description: comercio.contenido.heroDescripcion };
}

export default async function CatalogoLayout({ children, params }: Props) {
  const { slug } = await params;
  const comercio = await obtenerComercio(slug);
  if (!comercio) notFound();

  if (!comercio.activo) return <EnConstruccion comercio={comercio} />;

  return (
    <div
      style={cssVarsDelTema(comercio.tema)}
      className="min-h-screen bg-(--color-fondo) font-[family-name:var(--fuente-texto)] text-(--color-texto)"
    >
      <CarritoProvider
        slug={comercio.slug}
        metodosPago={comercio.configuracion.metodosPago.filter((metodo) => metodo.activo)}
        descuentos={comercio.configuracion.descuentosPorVolumen}
      >
        {children}
        <PanelCarrito />
      </CarritoProvider>
    </div>
  );
}
