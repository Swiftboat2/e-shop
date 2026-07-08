// Prueba mínima de vida contra los emuladores: escribe y lee un documento
// vía Admin SDK. Se ejecuta con: firebase emulators:exec "node scripts/smoke-emuladores.mjs"
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const app = initializeApp({ projectId: "demo-eshop" });
const db = getFirestore(app);

(async () => {
  const ref = db.doc("comercios/smoke-test");
  await ref.set({ nombre: "Smoke Test", activo: false });
  const snap = await ref.get();
  await ref.delete();

  if (snap.data()?.nombre !== "Smoke Test") {
    throw new Error("La lectura no devolvió lo escrito");
  }
  console.log("firestore-emulador-ok");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
