"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { actualizarComercio } from "./mutaciones";

export function EstadoPublicacion({
  slug,
  activoInicial,
}: {
  slug: string;
  activoInicial: boolean;
}) {
  const [activo, setActivo] = useState(activoInicial);
  const [confirmando, setConfirmando] = useState(false);
  const [cambiando, setCambiando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const cambiar = async (nuevo: boolean) => {
    setCambiando(true);
    setError(null);
    try {
      await actualizarComercio(slug, { activo: nuevo });
      setActivo(nuevo);
      setConfirmando(false);
      router.refresh();
    } catch {
      setError("No se pudo cambiar el estado.");
    }
    setCambiando(false);
  };

  return (
    <div className="rounded-(--admin-radio-lg) border border-(--admin-borde) bg-(--admin-superficie) p-4">
      <p className="text-sm text-(--admin-texto-secundario)">Estado de la tienda</p>
      <p className="mt-1 font-semibold">{activo ? "Publicada" : "En construcción"}</p>

      <div className="mt-3">
        {!activo ? (
          <button
            type="button"
            onClick={() => void cambiar(true)}
            disabled={cambiando}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
          >
            {cambiando ? "Publicando..." : "Publicar mi tienda"}
          </button>
        ) : confirmando ? (
          <span className="flex items-center gap-2 text-sm">
            ¿Ocultar la tienda al público?
            <button
              type="button"
              onClick={() => void cambiar(false)}
              disabled={cambiando}
              className="font-bold text-red-600"
            >
              Sí
            </button>
            <button type="button" onClick={() => setConfirmando(false)} className="font-bold">
              No
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmando(true)}
            className="rounded-(--admin-radio-md) border border-(--admin-borde) px-4 py-2 text-sm font-semibold text-(--admin-texto-secundario)"
          >
            Despublicar
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
