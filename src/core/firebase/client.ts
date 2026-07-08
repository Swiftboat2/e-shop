import { getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectStorageEmulator, getStorage } from "firebase/storage";

// En desarrollo el SDK habla con los emuladores por defecto (proyecto demo-*,
// sin credenciales); NEXT_PUBLIC_FIREBASE_EMULATORS=0 lo desactiva.
const usarEmuladores =
  process.env.NEXT_PUBLIC_FIREBASE_EMULATORS === "1" ||
  (process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_FIREBASE_EMULATORS !== "0");

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "demo-eshop.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "demo-eshop",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "demo-eshop.appspot.com",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "demo-app-id",
};

declare global {
  var firebaseEmulatorsConnected: boolean | undefined;
}

const app = getApps()[0] ?? initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// El flag global evita reconectar los emuladores en cada hot reload.
if (usarEmuladores && !globalThis.firebaseEmulatorsConnected) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectStorageEmulator(storage, "127.0.0.1", 9199);
  globalThis.firebaseEmulatorsConnected = true;
}
