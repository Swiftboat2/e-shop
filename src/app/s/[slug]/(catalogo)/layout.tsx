import type { Metadata } from "next";
import { headers } from "next/headers";
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

  // El og:image se arma a mano contra el host público real: el file
  // convention (`opengraph-image.tsx`) resuelve su URL absoluta contra el
  // pathname interno post-rewrite (/s/{slug}/...) en vez del dominio
  // público del tenant, así que acá se usa un route handler propio
  // (./opengraph-image/route.tsx) y se referencia con la ruta pública tal
  // como la vería un navegador o un crawler.
  const host = (await headers()).get("host");
  const protocolo = host?.includes("localhost") ? "http" : "https";
  const urlImagen = host ? `${protocolo}://${host}/opengraph-image` : undefined;

  if (!comercio?.activo) {
    return {
      title: comercio?.nombre,
      openGraph: urlImagen ? { images: [urlImagen] } : undefined,
    };
  }

  const { nombre } = comercio;
  const descripcion = comercio.contenido.heroDescripcion || undefined;

  // openGraph/twitter van explícitos: sin esto los crawlers (WhatsApp
  // incluido, el canal por el que se comparte el link) no arman el
  // preview con título y descripción, solo con la imagen del tenant.
  return {
    title: nombre,
    description: descripcion,
    openGraph: {
      title: nombre,
      description: descripcion,
      type: "website",
      images: urlImagen ? [urlImagen] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: nombre,
      description: descripcion,
      images: urlImagen ? [urlImagen] : undefined,
    },
  };
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
