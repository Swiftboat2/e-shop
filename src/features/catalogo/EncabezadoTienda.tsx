import Image from "next/image";
import { BotonCarritoHeader } from "@/features/carrito/BotonCarritoHeader";
import type { Comercio } from "@/core/types";

export function EncabezadoTienda({ comercio }: { comercio: Comercio }) {
  return (
    <header className="sticky top-0 z-20 h-14 border-b border-black/10 bg-(--color-fondo)/90 shadow-sm backdrop-blur-md transition-shadow">
      <div className="mx-auto flex h-full max-w-5xl items-center gap-3 px-4">
        {comercio.logoUrl ? (
          <Image
            src={comercio.logoUrl}
            alt={`Logo de ${comercio.nombre}`}
            width={36}
            height={36}
            unoptimized
            className="size-9 rounded-full object-cover"
          />
        ) : (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-(--color-primario) font-bold text-white">
            {comercio.nombre.charAt(0)}
          </span>
        )}
        <p className="truncate text-lg font-bold tracking-tight">{comercio.nombre}</p>
        <BotonCarritoHeader />
      </div>
    </header>
  );
}
