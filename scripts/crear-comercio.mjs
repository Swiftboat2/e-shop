// Alta técnica de un comercio (spec sección 12): crea el documento con
// defaults seguros para cualquier rubro, el usuario en Firebase Auth y su
// registro en admins. No hay panel de super admin: esto se ejecuta a mano.
// Uso: npm run crear-comercio -- <slug> <nombre> <whatsapp> <email> [password]

import { randomInt } from "node:crypto";
import { validarSlug } from "../src/core/dominio/slug.ts";

const produccion = Boolean(process.env.FIREBASE_SERVICE_ACCOUNT);
if (!produccion) {
  process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";
  process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099";
}

const { cert, initializeApp } = await import("firebase-admin/app");
const { getAuth } = await import("firebase-admin/auth");
const { getFirestore } = await import("firebase-admin/firestore");

const app = produccion
  ? initializeApp({
      credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    })
  : initializeApp({ projectId: "demo-eshop" });

const [slug, nombre, whatsappNumero, email, passwordArg] = process.argv.slice(2);

function abortar(mensaje) {
  console.error(`Error: ${mensaje}`);
  process.exit(1);
}

if (!slug || !nombre || !whatsappNumero || !email) {
  console.error("Uso: npm run crear-comercio -- <slug> <nombre> <whatsapp> <email> [password]");
  console.error('Ej.:  npm run crear-comercio -- la-esquina "Kiosco La Esquina" 5493512223344 dueno@mail.com');
  process.exit(1);
}

const errorSlug = validarSlug(slug);
if (errorSlug) abortar(errorSlug);
if (!/^\d{8,15}$/.test(whatsappNumero)) {
  abortar("El WhatsApp va en formato internacional, solo dígitos y sin '+' (ej. 5493512223344).");
}
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) abortar("El email no es válido.");

const generarPassword = () => {
  const alfabeto = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 12 }, () => alfabeto[randomInt(alfabeto.length)]).join("");
};
const password = passwordArg ?? generarPassword();
if (password.length < 8) abortar("La contraseña debe tener al menos 8 caracteres.");

const db = getFirestore(app);
const auth = getAuth(app);

const referencia = db.doc(`comercios/${slug}`);
if ((await referencia.get()).exists) abortar(`El slug "${slug}" ya está tomado.`);

const usuarioExistente = await auth.getUserByEmail(email).catch(() => null);
if (usuarioExistente) abortar(`Ya existe un usuario con el email ${email}.`);

const usuario = await auth.createUser({ email, password });

const batch = db.batch();
batch.set(referencia, {
  nombre,
  logoUrl: "",
  whatsappNumero,
  activo: false,
  onboardingCompletado: false,
  plan: "estandar",
  timezone: "America/Argentina/Buenos_Aires",
  createdAt: new Date(),
  tema: {
    colorPrimario: "#0f766e",
    colorSecundario: "#b45309",
    colorFondo: "#fafaf9",
    colorTexto: "#1c1917",
    fuente: "inter",
  },
  contenido: { heroTitulo: "", heroTituloDestacado: "", heroDescripcion: "", heroBadge: "" },
  features: [],
  contacto: { telefono: "", direccion: "", mapLat: 0, mapLng: 0 },
  horarios: [],
  configuracion: {
    metodosPago: [{ id: "efectivo", nombre: "Efectivo", activo: true }],
    unidadesDeVentaDisponibles: [{ valor: "unidad", etiqueta: "Por unidad" }],
    descuentosPorVolumen: { activo: false, soloMetodosDePago: null, reglas: [] },
  },
});
batch.set(db.doc(`comercios/${slug}/admins/${usuario.uid}`), {
  email,
  rol: "owner",
  createdAt: new Date(),
});
await batch.commit();

const dominio = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000";
const protocolo = dominio.includes("localhost") ? "http" : "https";
console.log(`\nComercio creado: ${nombre}`);
console.log(`  Tienda:  ${protocolo}://${slug}.${dominio}  (en construcción hasta publicar)`);
console.log(`  Panel:   ${protocolo}://${slug}.${dominio}/admin`);
console.log(`  Email:   ${email}`);
console.log(`  Clave temporal: ${password}`);
console.log("\nCompartí el acceso con el dueño del local. Categorías y productos arrancan vacíos.");
process.exit(0);
