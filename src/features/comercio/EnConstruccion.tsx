import type { Comercio } from "@/core/types";

export function EnConstruccion({ comercio }: { comercio: Comercio }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 p-8 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-black/5 text-2xl font-bold">
        {comercio.nombre.charAt(0)}
      </span>
      <h1 className="text-2xl font-bold">{comercio.nombre}</h1>
      <p className="text-lg opacity-70">Esta tienda está en construcción. ¡Volvé pronto!</p>
    </main>
  );
}
