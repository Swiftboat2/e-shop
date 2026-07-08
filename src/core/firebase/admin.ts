import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "demo-eshop";

// Sin service account y fuera de producción se apunta a los emuladores.
// El Admin SDK los detecta por estas variables, que deben existir ANTES
// de instanciar los servicios.
const usarEmuladores =
  !process.env.FIREBASE_SERVICE_ACCOUNT && process.env.NODE_ENV !== "production";

if (usarEmuladores) {
  process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";
  process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099";
  process.env.FIREBASE_STORAGE_EMULATOR_HOST ??= "127.0.0.1:9199";
}

function crearAdminApp(): App {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (serviceAccount) {
    return initializeApp({ credential: cert(JSON.parse(serviceAccount)), projectId });
  }
  return initializeApp({ projectId });
}

const adminApp = getApps()[0] ?? crearAdminApp();

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
export const adminStorage = getStorage(adminApp);
