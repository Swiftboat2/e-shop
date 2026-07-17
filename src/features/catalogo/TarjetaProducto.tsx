import Image from "next/image";
import { formatearPrecio } from "@/core/dominio/precio";
import { BotonAgregar } from "@/features/carrito/BotonAgregar";
import type { Producto } from "@/core/types";

export function TarjetaProducto({ producto }: { producto: Producto }) {
  const esFraccionado = producto.tipoVenta === "fraccionado";

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-(--color-borde) bg-(--color-superficie) transition-[transform,border-color] duration-150 hover:border-(--color-primario) active:border-(--color-primario) motion-safe:hover:scale-[1.02] motion-safe:active:scale-[1.02]">
      {producto.imagenUrl ? (
        <Image
          src={producto.imagenUrl}
          alt={producto.nombre}
          width={400}
          height={400}
          unoptimized
          className="aspect-square w-full object-cover"
        />
      ) : (
        <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-(--color-primario)/15 to-(--color-secundario)/15 font-[family-name:var(--fuente-display)] text-4xl font-bold text-(--color-primario)">
          {producto.nombre.charAt(0)}
        </div>
      )}
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="font-[family-name:var(--fuente-display)] text-sm font-semibold leading-tight">
          {producto.nombre}
        </h3>
        {producto.descripcion && (
          <p className="line-clamp-2 text-xs opacity-60">{producto.descripcion}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <p className="font-[family-name:var(--fuente-display)] font-bold tabular-nums">
            ${formatearPrecio(producto.precio)}
            {esFraccionado && producto.unidadMedida && (
              <span className="text-xs font-normal opacity-60"> /{producto.unidadMedida}</span>
            )}
          </p>
          <BotonAgregar producto={producto} />
        </div>
      </div>
    </article>
  );
}
