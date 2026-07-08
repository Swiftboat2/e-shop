import { doc, getDoc } from "firebase/firestore";
import { db } from "@/core/firebase/client";

/**
 * Un usuario es admin del comercio si existe comercios/{slug}/admins/{uid}.
 * Las Security Rules solo permiten leer el documento propio, así que esta
 * consulta únicamente puede confirmar la pertenencia del usuario logueado.
 */
export async function esAdminDelComercio(slug: string, uid: string): Promise<boolean> {
  try {
    const snapshot = await getDoc(doc(db, "comercios", slug, "admins", uid));
    return snapshot.exists();
  } catch {
    return false;
  }
}
