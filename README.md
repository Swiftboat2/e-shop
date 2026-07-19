# Plataforma de catálogos multi-tenant con pedidos por WhatsApp

Cada comercio tiene su tienda en un subdominio propio (`{comercio}.midominio.com`), donde el cliente final arma un carrito y confirma el pedido vía WhatsApp. El dominio raíz sirve la landing de la plataforma.

Stack: Next.js 16 (App Router) · TypeScript estricto · Tailwind CSS 4 · Firebase (Firestore, Auth, Storage) · Vitest.

## Desarrollo

Requisitos: Node 20+, Java 11+ (para los emuladores de Firebase).

```bash
# Terminal 1: emuladores de Firebase (Firestore, Auth, Storage + UI en :4000)
npm run emulators          # primera vez: npm run emulators:fresh

# Terminal 2: servidor de desarrollo
npm run dev

# Una única vez, con los emuladores arriba: carga el tenant de demo
npm run seed:demo
```

Los datos de los emuladores persisten entre corridas en `./emulator-data` (se exportan al apagarlos). Si se pierden, `npm run seed:demo` los regenera en segundos.

En desarrollo **todo corre contra los emuladores por defecto**, sin credenciales ni archivo `.env` (el proyecto `demo-eshop` es 100% offline). Para desactivar ese comportamiento: `NEXT_PUBLIC_FIREBASE_EMULATORS=0`.

### Subdominios en local

Los navegadores resuelven `*.localhost` solos, sin tocar `/etc/hosts`:

- Landing: <http://localhost:3000>
- Tienda de un comercio: <http://demo.localhost:3000>

## Tests

```bash
npm test              # una corrida
npm run test:watch    # modo watch
npm run test:coverage # cobertura (umbral 80% sobre src/core)
```

## Estructura

```
src/
├── proxy.ts          # ruteo por subdominio: Host → rewrite a /s/{slug}
├── app/
│   ├── (landing)/    # dominio raíz
│   └── s/[slug]/     # tienda de cada tenant (destino interno del rewrite)
├── core/
│   ├── dominio/      # lógica pura de negocio (horarios, descuentos, WhatsApp)
│   ├── firebase/     # inicialización client SDK + Admin SDK
│   └── types/        # modelo de datos (Comercio, Producto, Pedido, ...)
└── features/         # UI y lógica por feature
```

## Deploy (Vercel + Firebase real)

Checklist, en orden. `.env.example` tiene el detalle de cada variable.

- [ ] **Firebase**: crear el proyecto real en [Firebase Console](https://console.firebase.google.com/), habilitar Firestore, Auth (proveedor email/password) y Storage. Storage requiere plan **Blaze** (pay-as-you-go) — Spark no alcanza.
- [ ] Generar el service account: Configuración del proyecto → Cuentas de servicio → Generar nueva clave privada. Guardar el JSON, no commitearlo.
- [ ] Desplegar las Security Rules contra ese proyecto: `npx firebase deploy --only firestore:rules,storage --project <id-real>`.
- [ ] **Dominio**: comprarlo si todavía no existe. En Vercel → Project Settings → Domains, agregar `midominio.com` **y** `*.midominio.com`, y delegar los nameservers del dominio a Vercel (requisito para el SSL wildcard automático — sin esto los subdominios de cada comercio no van a levantar).
- [ ] **Vercel**: importar el repo y cargar ahí las variables de entorno (ver tabla abajo o `.env.example`). `FIREBASE_SERVICE_ACCOUNT` es secreto: pegarlo solo en el panel de env vars de Vercel.
- [ ] Primer deploy. Confirmar que la landing carga en `midominio.com`.
- [ ] **Tenant demo**: `npm run crear-comercio -- demo "Nombre Demo" <whatsapp-de-testing> <email>` contra producción (con `FIREBASE_SERVICE_ACCOUNT` y `NEXT_PUBLIC_FIREBASE_PROJECT_ID` en el entorno del comando). Cargar categorías/productos a mano o adaptar `scripts/seed-demo.mjs` como referencia. Publicarlo desde `/admin` cuando esté listo.
- [ ] **Primer comercio real**: mismo comando `crear-comercio` con sus datos. Compartirle el link del panel y la clave temporal que imprime el script.
- [ ] Antes de mandar el link a un comercio: confirmar que compartiéndolo por WhatsApp se ve bien el preview (título, descripción e imagen — ver `/opengraph-image` de su subdominio).

## Variables de entorno (producción)

En desarrollo no hace falta ninguna — corre todo contra los emuladores (ver arriba). Para producción (Vercel), copiar de `.env.example`:

| Variable | Descripción |
| --- | --- |
| `NEXT_PUBLIC_ROOT_DOMAIN` | Dominio raíz sin protocolo, ej. `midominio.com` |
| `NEXT_PUBLIC_WHATSAPP_CONTACTO` | WhatsApp de la plataforma (no el de un comercio), formato internacional sin `+`. Alimenta el botón "Hablar por WhatsApp" de la landing |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Config web del proyecto real de Firebase |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | ídem |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ídem |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | ídem |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | ídem |
| `FIREBASE_SERVICE_ACCOUNT` | JSON del service account (Admin SDK) en una sola línea. Secreto: dueño de acceso admin a Firestore/Auth/Storage sin pasar por las Security Rules |
