import type { Feature } from "@/core/types";

const ICONOS: Record<string, React.ReactNode> = {
  envio: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4 shrink-0">
      <path d="M2 7h12v9H2zM14 10h4l3 3v3h-7z" />
      <circle cx="6" cy="18" r="1.6" />
      <circle cx="17.5" cy="18" r="1.6" />
    </svg>
  ),
  calidad: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4 shrink-0">
      <path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6L12 16.7 6.6 19.6l1.1-6-4.5-4.2 6.1-.8z" />
    </svg>
  ),
  atencion: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4 shrink-0">
      <path d="M4 5h16v11H9l-5 4z" />
    </svg>
  ),
  pago: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4 shrink-0">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-4 shrink-0">
      <path d="m4 12.5 5 5L20 6.5" />
    </svg>
  ),
};

export function FeaturesTienda({ features }: { features: Feature[] }) {
  if (features.length === 0) return null;

  return (
    <section
      className="mx-auto flex max-w-5xl flex-wrap justify-center gap-2 px-4"
      style={{ paddingBottom: "var(--tema-espaciado-seccion)" }}
    >
      {features.map((feature) => (
        <div
          key={feature.texto}
          className="flex items-center gap-2 rounded-full bg-(--color-primario)/10 px-4 py-2 text-sm font-medium text-(--color-primario)"
        >
          {ICONOS[feature.icono] ?? ICONOS.check}
          {feature.texto}
        </div>
      ))}
    </section>
  );
}
