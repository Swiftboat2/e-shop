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

1. **Firebase**: crear el proyecto real (Firestore, Auth email/password, Storage) y desplegar las reglas: `npx firebase deploy --only firestore:rules,storage --project <id-real>`.
2. **Vercel**: importar el repo. Cargar las variables de entorno de la tabla de abajo.
3. **Dominio wildcard**: en Vercel, agregar los dominios `midominio.com` y `*.midominio.com` al proyecto, y delegar los nameservers del dominio a Vercel (requisito para el SSL wildcard automático).
4. **Alta de comercios en producción**: `FIREBASE_SERVICE_ACCOUNT='<json>' NEXT_PUBLIC_FIREBASE_PROJECT_ID=<id> npm run crear-comercio -- <slug> "<nombre>" <whatsapp> <email>`.
5. **Tenant demo**: cargarlo apuntando el flujo de WhatsApp a un número de testing propio (ver `scripts/seed-demo.mjs` como referencia de datos).

## Variables de entorno (producción)

En desarrollo no hace falta ninguna. Para producción (Vercel):

| Variable | Descripción |
| --- | --- |
| `NEXT_PUBLIC_ROOT_DOMAIN` | Dominio raíz sin protocolo, ej. `midominio.com` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Config web del proyecto real de Firebase |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | ídem |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ídem |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | ídem |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | ídem |
| `FIREBASE_SERVICE_ACCOUNT` | JSON del service account (Admin SDK) en una sola línea |
