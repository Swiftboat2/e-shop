import { notFound } from "next/navigation";
import { BannerApertura } from "@/features/catalogo/BannerApertura";
import { EncabezadoTienda } from "@/features/catalogo/EncabezadoTienda";
import { FeaturesTienda } from "@/features/catalogo/FeaturesTienda";
import { Hero } from "@/features/catalogo/Hero";
import { NavCategorias } from "@/features/catalogo/NavCategorias";
import { SeccionProductos } from "@/features/catalogo/SeccionProductos";
import { SeccionUbicacion } from "@/features/catalogo/SeccionUbicacion";
import { obtenerCategorias, obtenerComercio, obtenerProductos } from "@/features/comercio/datos";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CatalogoPage({ params }: Props) {
  const { slug } = await params;
  const comercio = await obtenerComercio(slug);
  if (!comercio) notFound();

  const [categorias, productos] = await Promise.all([
    obtenerCategorias(slug),
    obtenerProductos(slug),
  ]);

  const secciones = categorias
    .map((categoria) => ({
      categoria,
      productos: productos.filter((producto) => producto.categoriaId === categoria.id),
    }))
    .filter((seccion) => seccion.productos.length > 0);

  return (
    <>
      <EncabezadoTienda comercio={comercio} />
      <BannerApertura horarios={comercio.horarios} timezone={comercio.timezone} />
      <Hero contenido={comercio.contenido} />
      <FeaturesTienda features={comercio.features} />
      <NavCategorias categorias={secciones.map((seccion) => seccion.categoria)} />
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-8 pb-16">
        {secciones.map(({ categoria, productos: productosDeCategoria }) => (
          <SeccionProductos
            key={categoria.id}
            categoria={categoria}
            productos={productosDeCategoria}
          />
        ))}
      </div>
      <SeccionUbicacion contacto={comercio.contacto} horarios={comercio.horarios} />
    </>
  );
}
