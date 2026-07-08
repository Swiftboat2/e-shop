export function SeccionPendiente({
  titulo,
  descripcion,
}: {
  titulo: string;
  descripcion: string;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h1 className="text-2xl font-bold">{titulo}</h1>
      <p className="max-w-lg text-stone-600">{descripcion}</p>
      <p className="mt-4 w-fit rounded-lg border border-dashed border-stone-300 bg-white px-4 py-3 text-sm text-stone-500">
        Esta sección se habilita próximamente.
      </p>
    </section>
  );
}
