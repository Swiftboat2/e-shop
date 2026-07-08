import { cache } from "react";
import { adminDb } from "@/core/firebase/admin";
import type { Categoria, Comercio, Producto } from "@/core/types";

// Lecturas server-side con Admin SDK (bypasea las Security Rules): el gate de
// visibilidad pública (activo) se decide en el layout del tenant.
// cache() dedupe la lectura entre layout, metadata y page del mismo request.

export const obtenerComercio = cache(async (slug: string): Promise<Comercio | null> => {
  const snap = await adminDb.doc(`comercios/${slug}`).get();
  if (!snap.exists) return null;

  const data = snap.data()!;
  return {
    ...data,
    slug: snap.id,
    createdAt: data.createdAt?.toDate?.() ?? new Date(0),
  } as Comercio;
});

export const obtenerCategorias = cache(async (slug: string): Promise<Categoria[]> => {
  const snap = await adminDb.collection(`comercios/${slug}/categorias`).orderBy("orden").get();
  return snap.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as Categoria)
    .filter((categoria) => categoria.activo);
});

// El filtro de disponibles va en memoria: where + orderBy sobre campos
// distintos exigiría un índice compuesto, y los catálogos son chicos.
export const obtenerProductos = cache(async (slug: string): Promise<Producto[]> => {
  const snap = await adminDb.collection(`comercios/${slug}/productos`).orderBy("orden").get();
  return snap.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as Producto)
    .filter((producto) => producto.disponible);
});
