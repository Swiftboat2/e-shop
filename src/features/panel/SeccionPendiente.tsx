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
      <p className="max-w-lg text-(--admin-texto-secundario)">{descripcion}</p>
      <p className="mt-4 w-fit rounded-(--admin-radio-md) border border-dashed border-(--admin-borde) bg-(--admin-superficie) px-4 py-3 text-sm text-(--admin-texto-secundario)">
        Esta sección se habilita próximamente.
      </p>
    </section>
  );
}
