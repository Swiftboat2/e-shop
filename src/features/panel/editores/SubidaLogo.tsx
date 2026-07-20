"use client";

import { useState } from "react";
import Image from "next/image";
import { actualizarComercio, subirLogoComercio } from "../mutaciones";

/** Sube el logo y lo guarda en el comercio al instante (la subida ya es un
 * efecto: no tiene sentido un paso extra de "guardar"). */
export function SubidaLogo({ slug, logoUrl }: { slug: string; logoUrl: string }) {
  const [url, setUrl] = useState(logoUrl);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subir = async (archivo: File | undefined) => {
    if (!archivo) return;
    setSubiendo(true);
    setError(null);
    try {
      const nueva = await subirLogoComercio(slug, archivo);
      await actualizarComercio(slug, { logoUrl: nueva });
      setUrl(nueva);
    } catch {
      setError("No se pudo subir el logo.");
    }
    setSubiendo(false);
  };

  return (
    <div className="flex items-center gap-3">
      {url ? (
        <Image
          src={url}
          alt="Logo del comercio"
          width={48}
          height={48}
          unoptimized
          className="size-12 rounded-full object-cover"
        />
      ) : (
        <span className="flex size-12 items-center justify-center rounded-full bg-(--admin-acento-suave) text-xs text-(--admin-texto-secundario)">
          Logo
        </span>
      )}
      <label className="flex flex-col gap-1 text-sm font-medium">
        Logo del comercio
        <input
          type="file"
          accept="image/*"
          disabled={subiendo}
          onChange={(evento) => void subir(evento.target.files?.[0])}
          className="text-sm"
        />
      </label>
      {subiendo && <span className="text-sm text-(--admin-texto-secundario)">Subiendo...</span>}
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  );
}
