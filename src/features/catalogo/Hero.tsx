import type { Contenido } from "@/core/types";

export function Hero({ contenido }: { contenido: Contenido }) {
  return (
    <section
      className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 text-center"
      style={{
        paddingTop: "var(--tema-espaciado-seccion)",
        paddingBottom: "var(--tema-espaciado-seccion)",
      }}
    >
      {contenido.heroBadge && (
        <span className="rounded-full bg-(--color-secundario)/15 px-4 py-1 text-sm font-semibold text-(--color-secundario)">
          {contenido.heroBadge}
        </span>
      )}
      <h1 className="max-w-2xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
        {contenido.heroTitulo}{" "}
        <span className="text-(--color-primario)">{contenido.heroTituloDestacado}</span>
      </h1>
      {contenido.heroDescripcion && (
        <p className="max-w-xl text-lg opacity-70">{contenido.heroDescripcion}</p>
      )}
    </section>
  );
}
