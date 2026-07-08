import { readFileSync } from "node:fs";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { collection, doc, getDoc, setDoc, updateDoc, writeBatch } from "firebase/firestore";
import { afterAll, beforeAll, describe, it } from "vitest";

// Tests de las Security Rules contra el emulador real, en un proyecto
// aislado (demo-rules-test) para no pisar los datos de desarrollo.
const emuladorDisponible = await fetch("http://127.0.0.1:8080", {
  signal: AbortSignal.timeout(500),
})
  .then((respuesta) => respuesta.ok)
  .catch(() => false);

describe.skipIf(!emuladorDisponible)("firestore.rules", () => {
  let entorno: RulesTestEnvironment;

  beforeAll(async () => {
    entorno = await initializeTestEnvironment({
      projectId: "demo-rules-test",
      firestore: {
        rules: readFileSync("firestore.rules", "utf8"),
        host: "127.0.0.1",
        port: 8080,
      },
    });
    await entorno.clearFirestore();

    await entorno.withSecurityRulesDisabled(async (contexto) => {
      const db = contexto.firestore();
      await setDoc(doc(db, "comercios/tienda-a"), { nombre: "Tienda A", activo: true });
      await setDoc(doc(db, "comercios/tienda-a/admins/admin-a"), { email: "a@a.com", rol: "owner" });
      await setDoc(doc(db, "comercios/tienda-a/productos/prod-1"), {
        nombre: "Producto",
        disponible: true,
        precio: 100,
        orden: 1,
      });
      await setDoc(doc(db, "comercios/tienda-a/pedidos/ped-1"), { estado: "pendiente", total: 10 });
      await setDoc(doc(db, "comercios/tienda-b"), { nombre: "Tienda B", activo: false });
      await setDoc(doc(db, "comercios/tienda-b/admins/admin-b"), { email: "b@b.com", rol: "owner" });
    });
  });

  afterAll(async () => {
    await entorno.cleanup();
  });

  const anonimo = () => entorno.unauthenticatedContext().firestore();
  const adminA = () => entorno.authenticatedContext("admin-a").firestore();
  const adminB = () => entorno.authenticatedContext("admin-b").firestore();

  it("el catálogo es público, pero un comercio no publicado no se lee sin auth", async () => {
    await assertSucceeds(getDoc(doc(anonimo(), "comercios/tienda-a")));
    await assertSucceeds(getDoc(doc(anonimo(), "comercios/tienda-a/productos/prod-1")));
    await assertFails(getDoc(doc(anonimo(), "comercios/tienda-b")));
  });

  it("el dueño sí lee su comercio aunque siga en onboarding", async () => {
    await assertSucceeds(getDoc(doc(adminB(), "comercios/tienda-b")));
  });

  it("nadie crea pedidos desde el cliente: van por Server Action", async () => {
    const pedido = { total: 1, estado: "pendiente", items: [] };
    await assertFails(setDoc(doc(anonimo(), "comercios/tienda-a/pedidos/nuevo"), pedido));
    await assertFails(setDoc(doc(adminA(), "comercios/tienda-a/pedidos/nuevo"), pedido));
  });

  it("solo el admin del comercio lee y actualiza sus pedidos", async () => {
    await assertSucceeds(getDoc(doc(adminA(), "comercios/tienda-a/pedidos/ped-1")));
    await assertSucceeds(
      updateDoc(doc(adminA(), "comercios/tienda-a/pedidos/ped-1"), { estado: "aceptado" }),
    );
    await assertFails(getDoc(doc(anonimo(), "comercios/tienda-a/pedidos/ped-1")));
    await assertFails(getDoc(doc(adminB(), "comercios/tienda-a/pedidos/ped-1")));
  });

  it("el admin escribe su catálogo; anónimos y admins ajenos, no", async () => {
    await assertSucceeds(
      setDoc(doc(adminA(), "comercios/tienda-a/productos/nuevo"), {
        nombre: "Nuevo",
        precio: 5,
        disponible: true,
        orden: 2,
      }),
    );
    await assertFails(setDoc(doc(anonimo(), "comercios/tienda-a/productos/hack"), { nombre: "H" }));
    await assertFails(setDoc(doc(adminB(), "comercios/tienda-a/productos/hack"), { nombre: "H" }));
  });

  it("el batch de categoría nueva + producto pasa las rules como una unidad", async () => {
    const db = adminA();
    const batch = writeBatch(db);
    const categoriaRef = doc(collection(db, "comercios/tienda-a/categorias"));
    batch.set(categoriaRef, { nombre: "Nueva", orden: 1, activo: true });
    batch.set(doc(db, "comercios/tienda-a/productos/con-categoria"), {
      nombre: "Con categoría",
      precio: 2,
      disponible: true,
      orden: 3,
      categoriaId: categoriaRef.id,
    });
    await assertSucceeds(batch.commit());
  });

  it("los admins solo se escriben server-side y cada uno lee solo su propio doc", async () => {
    await assertFails(
      setDoc(doc(adminA(), "comercios/tienda-a/admins/otro"), { email: "x@x.com", rol: "editor" }),
    );
    await assertSucceeds(getDoc(doc(adminA(), "comercios/tienda-a/admins/admin-a")));
    await assertFails(getDoc(doc(adminA(), "comercios/tienda-a/admins/admin-b")));
  });

  it("actualizar el comercio: su admin sí, un anónimo no", async () => {
    await assertSucceeds(updateDoc(doc(adminA(), "comercios/tienda-a"), { nombre: "Tienda A2" }));
    await assertFails(updateDoc(doc(anonimo(), "comercios/tienda-a"), { nombre: "Hackeada" }));
  });
});
