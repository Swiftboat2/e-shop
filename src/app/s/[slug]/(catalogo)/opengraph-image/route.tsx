import { ImageResponse } from "next/og";
import { obtenerComercio } from "@/features/comercio/datos";
import { colorSobrePrimario } from "@/features/comercio/tema";
import { NOMBRE_PLATAFORMA } from "@/features/landing/marca";

interface Contexto {
  params: Promise<{ slug: string }>;
}

const size = { width: 1200, height: 630 };

/**
 * Preview con la marca de cada comercio (colores de su tema, logo y
 * tagline) para que el link se vea bien al compartirlo por WhatsApp — el
 * canal por el que este producto entero se distribuye.
 *
 * Ruta explícita en vez del file convention `opengraph-image.tsx`: ese
 * convention resuelve la URL absoluta contra el pathname interno
 * post-rewrite (/s/{slug}/...), no contra el dominio público del tenant, y
 * termina generando un og:image roto. Acá se construye la URL a mano en
 * generateMetadata (layout.tsx) contra el host público real.
 */
export async function GET(_request: Request, { params }: Contexto) {
  const { slug } = await params;
  const comercio = await obtenerComercio(slug);

  if (!comercio) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#F5F3EF",
            color: "#1C1B19",
            fontSize: 64,
            fontWeight: 800,
          }}
        >
          {NOMBRE_PLATAFORMA}
        </div>
      ),
      size,
    );
  }

  const { tema, contenido, nombre, logoUrl } = comercio;
  const colorChip = colorSobrePrimario(tema.colorPrimario);

  const titulo = contenido.heroTitulo?.trim();
  const destacado = contenido.heroTituloDestacado?.trim();
  const descripcion = contenido.heroDescripcion?.trim();
  const badge = contenido.heroBadge?.trim();
  const tieneTagline = Boolean(titulo || destacado || descripcion);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: tema.colorFondo,
          color: tema.colorTexto,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {logoUrl ? (
            <img
              src={logoUrl}
              width={88}
              height={88}
              alt=""
              style={{ borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 88,
                height: 88,
                borderRadius: "50%",
                background: tema.colorPrimario,
                color: colorChip,
                fontSize: 44,
                fontWeight: 800,
              }}
            >
              {nombre.charAt(0)}
            </div>
          )}
          <div style={{ display: "flex", fontSize: 52, fontWeight: 800 }}>{nombre}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {tieneTagline && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                maxWidth: 980,
                fontSize: 40,
                fontWeight: 600,
                lineHeight: 1.25,
              }}
            >
              {titulo || destacado ? (
                <>
                  {titulo && <span style={{ marginRight: 14 }}>{titulo}</span>}
                  {destacado && <span style={{ color: tema.colorPrimario }}>{destacado}</span>}
                </>
              ) : (
                <span>{descripcion}</span>
              )}
            </div>
          )}
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              background: tema.colorPrimario,
              color: colorChip,
              padding: "14px 30px",
              borderRadius: 999,
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            {badge || "Pedís por WhatsApp"}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
