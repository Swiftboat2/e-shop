import type { Categoria } from "@/core/types";

export function NavCategorias({ categorias }: { categorias: Categoria[] }) {
  if (categorias.length === 0) return null;

  return (
    <nav className="sticky top-14 z-10 border-y border-black/10 bg-(--color-fondo)/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 py-2">
        {categorias.map((categoria) => (
          <a
            key={categoria.id}
            href={`#categoria-${categoria.id}`}
            className="whitespace-nowrap rounded-full border border-black/10 px-4 py-1.5 text-sm font-medium transition-colors hover:border-(--color-primario) hover:text-(--color-primario)"
          >
            {categoria.nombre}
          </a>
        ))}
      </div>
    </nav>
  );
}
