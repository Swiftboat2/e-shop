import { TarjetaProducto } from "@/features/catalogo/TarjetaProducto";
import type { Categoria, Producto } from "@/core/types";

export function SeccionProductos({
  categoria,
  productos,
}: {
  categoria: Categoria;
  productos: Producto[];
}) {
  return (
    <section id={`categoria-${categoria.id}`} className="scroll-mt-28">
      <h2 className="mb-4 text-2xl font-bold tracking-tight">{categoria.nombre}</h2>
      <div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
        style={{ gap: "var(--tema-espaciado-grid)" }}
      >
        {productos.map((producto) => (
          <TarjetaProducto key={producto.id} producto={producto} />
        ))}
      </div>
    </section>
  );
}
