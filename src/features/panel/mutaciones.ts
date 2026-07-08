import {
  collection,
  deleteDoc,
  doc,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "@/core/firebase/client";
import type { EstadoPedido, EstadoPresupuesto, Presupuesto, Producto } from "@/core/types";

export interface GuardarProductoParams {
  slug: string;
  /** null = alta; string = edición */
  productoId: string | null;
  datos: Omit<Producto, "id" | "categoriaId">;
  categoriaExistenteId: string | null;
  categoriaNueva: string | null;
  ordenCategoria: number;
}

/**
 * Guarda el producto. Si viene una categoría nueva, la crea en el MISMO
 * batch atómico: si algo falla, no queda ni la categoría suelta ni el
 * producto a medias (spec 10.5).
 */
export async function guardarProducto(params: GuardarProductoParams): Promise<void> {
  const productoRef = params.productoId
    ? doc(db, "comercios", params.slug, "productos", params.productoId)
    : doc(collection(db, "comercios", params.slug, "productos"));

  if (params.categoriaNueva) {
    const batch = writeBatch(db);
    const categoriaRef = doc(collection(db, "comercios", params.slug, "categorias"));
    batch.set(categoriaRef, {
      nombre: params.categoriaNueva,
      orden: params.ordenCategoria,
      activo: true,
    });
    batch.set(productoRef, { ...params.datos, categoriaId: categoriaRef.id });
    await batch.commit();
    return;
  }

  await setDoc(productoRef, { ...params.datos, categoriaId: params.categoriaExistenteId });
}

export async function eliminarProducto(slug: string, productoId: string): Promise<void> {
  await deleteDoc(doc(db, "comercios", slug, "productos", productoId));
}

export async function actualizarEstadoPedido(
  slug: string,
  pedidoId: string,
  estado: EstadoPedido,
): Promise<void> {
  await updateDoc(doc(db, "comercios", slug, "pedidos", pedidoId), { estado });
}

/**
 * Crea el presupuesto con numeración correlativa por comercio: el contador
 * vive en el doc del comercio y se incrementa en la MISMA transacción que
 * crea el presupuesto, así dos altas simultáneas nunca repiten número.
 */
export async function crearPresupuesto(
  slug: string,
  datos: Omit<Presupuesto, "id" | "numero" | "estado" | "createdAt">,
): Promise<number> {
  const comercioRef = doc(db, "comercios", slug);
  const presupuestoRef = doc(collection(db, "comercios", slug, "presupuestos"));

  return runTransaction(db, async (transaccion) => {
    const snapshot = await transaccion.get(comercioRef);
    const numero = ((snapshot.data()?.contadorPresupuestos as number | undefined) ?? 0) + 1;

    transaccion.update(comercioRef, { contadorPresupuestos: numero });
    transaccion.set(presupuestoRef, {
      ...datos,
      numero,
      estado: "borrador",
      createdAt: serverTimestamp(),
    });
    return numero;
  });
}

export async function actualizarEstadoPresupuesto(
  slug: string,
  presupuestoId: string,
  estado: EstadoPresupuesto,
): Promise<void> {
  await updateDoc(doc(db, "comercios", slug, "presupuestos", presupuestoId), { estado });
}

/** Actualización parcial del doc del comercio. Acepta dot paths de Firestore
 * (ej. "configuracion.metodosPago") para no pisar objetos anidados enteros. */
export async function actualizarComercio(
  slug: string,
  datos: Record<string, unknown>,
): Promise<void> {
  await updateDoc(doc(db, "comercios", slug), datos);
}

async function subirImagen(ruta: string, archivo: File): Promise<string> {
  const referencia = ref(storage, ruta);
  await uploadBytes(referencia, archivo, { contentType: archivo.type });
  return getDownloadURL(referencia);
}

export async function subirImagenProducto(slug: string, archivo: File): Promise<string> {
  return subirImagen(`comercios/${slug}/productos/${crypto.randomUUID()}-${archivo.name}`, archivo);
}

export async function subirLogoComercio(slug: string, archivo: File): Promise<string> {
  return subirImagen(`comercios/${slug}/logo-${crypto.randomUUID()}-${archivo.name}`, archivo);
}
