# Prompt para Claude Fable 5 — Plataforma E-commerce Multi-Tenant desde cero

Actuá como Arquitecto de Software y Desarrollador Fullstack Senior. Vamos a construir desde cero una plataforma de e-commerce multi-tenant orientada a catálogos digitales que se integran con WhatsApp, diseñada para servir a comercios de **cualquier rubro** (kioscos, hamburgueserías, ferreterías, indumentaria, comercios de venta a granel/por litro, etc.) — no debe haber ninguna lógica, texto ni estructura de datos atada a un rubro específico.

---

## 1. Modelo de negocio

- Cada comercio tiene su propia web accesible por subdominio dinámico: `nombre-comercio.midominio.com`. El dominio raíz (`midominio.com`) es la landing page del proyecto (vende la plataforma a comercios potenciales), completamente separada del catálogo.
- El cliente final entra al subdominio del comercio, navega un catálogo, arma un carrito, completa un formulario final (nombre, método de pago, dirección/notas) y al confirmar es redirigido a WhatsApp con el pedido formateado en texto plano, listo para enviar al número del comercio. La venta se cierra ahí — la plataforma no procesa pagos ni gestiona el pedido más allá de generar ese mensaje y (opcionalmente) registrarlo para estadísticas del comercio.
- Aislamiento total entre comercios: datos, panel de administración y administradores 100% separados. Ningún comercio accede ni cruza información de otro.
- Habrá un tenant especial de **demo**, con datos ficticios completos, usado para mostrarle la plataforma a comercios potenciales antes de que sean clientes reales.

---

## 2. Stack tecnológico recomendado (podés proponer alternativas si justificás por qué son mejores para este caso)

- **Frontend**: Next.js 15+ (App Router, Server Components + Server Actions donde aplique), TypeScript estricto, Tailwind CSS
- **UI Kit para el panel de administración**: shadcn/ui o similar, para acelerar tablas, formularios y componentes de datos sin sacrificar personalización
- **Base de datos**: Cloud Firestore (Firebase)
- **Autenticación**: Firebase Authentication (email/password para admins)
- **Storage de imágenes**: Firebase Storage
- **Operaciones server-side privilegiadas**: Next.js Server Actions / Route Handlers (`/api/...`) usando Firebase Admin SDK — para alta técnica de comercios, alta de administradores, y cualquier operación que no deba ejecutarse desde el cliente. Evitar desplegar Cloud Functions como proyecto separado en GCP salvo que surja una necesidad puntual que lo justifique (ej. triggers de Firestore); Vercel ya escala estas funciones serverless nativamente sin overhead adicional de infraestructura.
- **Hosting/DNS**: Vercel, con wildcard domain (`*.midominio.com`) configurado vía nameservers de Vercel para SSL automático
- **PDF (presupuestos)**: librería de generación de PDF en cliente o vía Route Handler

Justificación de por qué Next.js + Vercel para este caso: el ruteo por subdominio se resuelve de forma nativa con middleware de Next.js leyendo el header `Host`, y Vercel soporta wildcard domains en todos sus planes (incluido el gratuito), con generación automática de certificados SSL wildcard vía el método de nameservers.

---

## 3. Modelo de datos en Firestore

Usar el **slug del subdominio como Document ID** del comercio (no como campo dentro de un doc con ID autogenerado), para lookups directos y Security Rules simples basadas en path.

```
superAdmins (collection, a nivel raíz)
 └── {uid}                               // uid = Firebase Auth UID del dueño de la plataforma
      ├── email: string
      └── createdAt: timestamp

comercios (collection)
 └── {slug}                              // doc ID = slug del subdominio, ej "pizzeria-central"
      ├── nombre: string
      ├── logoUrl: string
      ├── whatsappNumero: string         // formato internacional sin "+"
      ├── activo: boolean                // false al crearse (alta técnica del super admin),
      │                                  // true recién cuando el dueño del local publica su tienda
      ├── onboardingCompletado: boolean  // false hasta que el dueño complete el wizard inicial
      │                                  // de personalización (independiente de "activo")
      ├── plan: string
      ├── createdAt: timestamp
      │
      ├── tema: {
      │     colorPrimario: string,
      │     colorSecundario: string,
      │     colorFondo: string,
      │     colorTexto: string,
      │     fuente: string               // de un set cerrado, no libre
      │   }
      │
      ├── contenido: {
      │     heroTitulo: string,
      │     heroTituloDestacado: string,
      │     heroDescripcion: string,
      │     heroBadge: string
      │   }
      │
      ├── features: [
      │     { icono: string, texto: string }, ...
      │   ]                              // icono de un set cerrado de íconos (bullets de marketing)
      │
      ├── contacto: {
      │     telefono: string,
      │     direccion: string,
      │     mapLat: number,
      │     mapLng: number
      │   }
      │
      ├── horarios: [
      │     { dia: number, apertura: "HH:MM", cierre: "HH:MM" }, ...
      │   ]                              // dia: 0=domingo..6=sábado. Estructurado para poder
      │                                  // CALCULAR si el comercio está abierto ahora, no solo mostrarlo
      │
      ├── configuracion: {
      │     metodosPago: [
      │       { id: string, nombre: string, activo: boolean }, ...
      │     ],                           // ej: [{id:"efectivo",nombre:"Efectivo",activo:true},
      │                                  // {id:"transferencia",nombre:"Transferencia",activo:true}]
      │                                  // Define qué métodos de pago ofrece ESTE comercio en su
      │                                  // checkout — nunca hardcodear una lista fija de métodos
      │                                  // en el frontend. Un comercio nuevo arranca con al menos
      │                                  // "efectivo" activo por defecto, editable desde su panel.
      │
      │     unidadesDeVentaDisponibles: [
      │       { valor: string, etiqueta: string }, ...
      │     ],                           // ej: [{valor:"unidad",etiqueta:"Por unidad"}] para la mayoría
      │                                  // de comercios. Un comercio que vende a granel/por medida
      │                                  // agrega también algo como {valor:"litro",etiqueta:"Por litro"}
      │                                  // o {valor:"metro",etiqueta:"Por metro"}. Si el array tiene
      │                                  // un solo valor, el formulario de carga de producto ni
      │                                  // muestra el selector — todo se carga con ese único formato.
      │
      │     descuentosPorVolumen: {
      │       activo: boolean,           // false por defecto — NINGÚN comercio nuevo tiene
      │                                  // descuentos por volumen a menos que los active explícitamente
      │       soloMetodosDePago: string[] | null,  // ids de configuracion.metodosPago a los que
      │                                  // se restringe el descuento, o null = aplica a todos
      │       reglas: [
      │         { desdeCantidad: number, descuentoPorcentaje: number }, ...
      │       ]
      │     }
      │   }
      │
      ├── categorias (subcollection)     // ÚNICA clasificación de producto. No existe ningún
      │     └── {categoriaId}            // enum fijo de "tipo de producto" — cada comercio define
      │           ├── nombre: string     // sus propias categorías libremente, arrancando VACÍO
      │           ├── orden: number      // (sin categorías pre-cargadas ni clonadas de otro comercio)
      │           └── activo: boolean
      │
      ├── productos (subcollection)
      │     └── {productoId}
      │           ├── nombre: string
      │           ├── descripcion: string
      │           ├── imagenUrl: string
      │           ├── disponible: boolean
      │           ├── orden: number
      │           ├── categoriaId: string
      │           ├── codigoBarras?: string        // opcional, solo visible en admin
      │           ├── tipoVenta: "unidad" | "fraccionado"
      │           ├── precio: number               // precio por unidad o por unidad de medida
      │           ├── unidadMedida?: string         // string LIBRE elegido por el comercio
      │                                             // ("litro", "kg", "metro", etc.) — nunca un enum
      │                                             // cerrado a un rubro específico. Solo aplica si
      │                                             // tipoVenta = "fraccionado"
      │           ├── pasoIncremento?: number       // ej 0.5 — de a cuánto sube el "+" del carrito.
      │                                             // Solo aplica si tipoVenta = "fraccionado"
      │           ├── cantidadMinima?: number       // ej 1 — mínimo de venta. Solo fraccionado
      │           ├── beneficios?: string[]         // lista libre de bullets del producto puntual
      │           │                                 // (ej "sin conservantes", "apto vegano").
      │           │                                 // Sin set cerrado — distinto de las `features`
      │           │                                 // del comercio, que son marketing del negocio
      │           │                                 // completo, no de un producto individual.
      │           └── variantes?: Variante[]        // RESERVADO para futuro (talle/color/tamaño).
      │                                             // Incluir el campo opcional en el tipo de datos,
      │                                             // pero NO implementar la UI de selección de
      │                                             // variantes en esta primera versión.
      │
      ├── pedidos (subcollection)
      │     └── {pedidoId}
      │           ├── items: [{ productoId, nombre, cantidad, precioUnitario, subtotal }]
      │           ├── total: number
      │           ├── descuentoAplicado: number
      │           ├── datosCliente: { nombre, metodoPago, direccion?, notas? }
      │           ├── estado: "pendiente" | "aceptado" | "ignorado"
      │           ├── createdAt: timestamp
      │           └── numeroCorto: string           // identificador corto legible para el admin
      │
      ├── presupuestos (subcollection) // NO son comprobantes fiscales — son cotizaciones
      │     └── {presupuestoId}         // enviables a un cliente antes de confirmar una venta
      │           ├── numero: number                // correlativo por comercio
      │           ├── datosCliente: { nombre, telefono?, notas? }
      │           ├── items: [{ descripcion, cantidad, unidad?, precioUnitario, subtotal }]
      │                                             // items del catálogo (buscables) o carga manual
      │           ├── subtotal: number
      │           ├── descuentoPorcentaje?: number
      │           ├── total: number
      │           ├── validezDias?: number          // ej 7 — vigencia opcional del presupuesto
      │           ├── estado: "borrador" | "enviado" | "aceptado" | "vencido"
      │           └── createdAt: timestamp
      │
      └── admins (subcollection)
            └── {uid}                    // uid = Firebase Auth UID
                  ├── email: string
                  ├── rol: "owner" | "editor"
                  └── createdAt: timestamp
```

**Decisiones de diseño importantes a respetar:**

- No existe ningún campo `tipo` de producto con valores fijos (nada equivalente a "suelto/envasado/pileta" de un sistema anterior). La única clasificación de producto es `categoriaId`, apuntando a la subcolección `categorias`, que cada comercio puebla libremente desde cero.
- Un comercio nuevo arranca con `categorias` **vacía**. No se clona ni se pre-carga ninguna categoría de otro comercio ni de ninguna plantilla.
- `unidadMedida` es siempre un string libre configurado por el comercio, nunca un enum cerrado a un rubro (nada de asumir "litro" como default o caso especial).
- `descuentosPorVolumen.activo` es `false` por defecto. Ningún comercio ve lógica de descuento a menos que la configure explícitamente desde su panel.
- Todo el contenido visual/textual (`tema`, `contenido`, `features`, `contacto`, `horarios`) es dato estructurado, nunca texto libre/HTML libre — esto permite que el mismo set de componentes sirva para cualquier rubro sin romper el layout.

---

## 4. Security Rules (Firestore)

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function esAdminDelComercio(slug) {
      return request.auth != null &&
        exists(/databases/$(database)/documents/comercios/$(slug)/admins/$(request.auth.uid));
    }

    function esSuperAdmin() {
      return request.auth != null &&
        exists(/databases/$(database)/documents/superAdmins/$(request.auth.uid));
    }

    match /comercios/{slug} {
      // Lectura pública solo si está activo (ya publicado). El admin del comercio y el super
      // admin pueden leerlo aunque todavía esté en onboarding (activo: false).
      allow read: if resource.data.activo == true || esAdminDelComercio(slug) || esSuperAdmin();
      allow update: if esAdminDelComercio(slug) || esSuperAdmin();
      allow create, delete: if esSuperAdmin(); // alta/baja técnica: solo el super admin

      match /categorias/{categoriaId} {
        allow read: if true; // catálogo público
        allow write: if esAdminDelComercio(slug);
      }

      match /productos/{productoId} {
        allow read: if true; // catálogo público
        allow write: if esAdminDelComercio(slug);
      }

      match /pedidos/{pedidoId} {
        // Público, pero con validación de payload para mitigar spam/inyección de datos basura:
        // total numérico positivo, estructura de items válida, y un máximo razonable de ítems
        // por pedido (ej. 50). Ver detalle de validación sugerida más abajo.
        allow create: if request.resource.data.total is number
                      && request.resource.data.total > 0
                      && request.resource.data.items is list
                      && request.resource.data.items.size() > 0
                      && request.resource.data.items.size() <= 50
                      && request.resource.data.estado == 'pendiente';
        allow read, update: if esAdminDelComercio(slug);
        allow delete: if false;
      }

      match /presupuestos/{presupuestoId} {
        allow read, write: if esAdminDelComercio(slug);
      }

      match /admins/{uid} {
        allow read: if request.auth != null && request.auth.uid == uid;
        allow write: if false; // alta de admins SIEMPRE server-side, nunca desde el cliente
      }
    }
  }
}
```

**Resolución del caso "tienda en construcción" (activo: false):** con la regla de arriba, un cliente final no autenticado NO puede leer el documento de un comercio con `activo: false` desde el cliente — esto es intencional. Para mostrar la pantalla "Esta tienda está en construcción" con el nombre/logo del comercio, el layout de Next.js correspondiente al segmento de ruta del tenant debe leer el documento del comercio **server-side usando Firebase Admin SDK** (que bypasea las Security Rules de cliente), no con el SDK de cliente. Esto ya es coherente con el enfoque de resolver el tema server-side (Sección 6) para evitar flashes — es la misma lectura server-side, solo que además decide qué layout renderizar (catálogo completo vs. pantalla de "en construcción") según el valor de `activo`.

---

## 5. Ruteo por subdominio (Next.js middleware)

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const dominioBase = "midominio.com";
  const esRaiz = host === dominioBase || host === `www.${dominioBase}`;

  if (esRaiz) return NextResponse.next(); // sirve la landing

  const slug = host.split(".")[0];
  const url = req.nextUrl.clone();
  url.pathname = `/_sites/${slug}${url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
```

En desarrollo local (sin dominio propio todavía), usar entradas en el archivo `hosts` del sistema (ej. `127.0.0.1 nombre-comercio.localhost`) para simular subdominios.

---

## 6. Theming dinámico

- Tailwind config con colores apuntando a CSS variables (`--color-primario`, etc.), nunca colores fijos hardcodeados en los componentes.
- El tema del comercio se resuelve **server-side** (en el layout del segmento de ruta del tenant) e inyecta las variables antes del render, para evitar flash de colores por defecto.
- Paleta de colores y fuentes disponibles: **set cerrado** (5-6 colores predefinidos, 3-4 fuentes precargadas), no color picker libre ni CSS custom — facilita mantener consistencia visual entre comercios de rubros distintos.

---

## 7. Catálogo público — layout y comportamiento (mobile-first, prioridad #1)

Objetivo: mínima fricción entre "entro a la web" y "confirmo el pedido por WhatsApp".

- **Header** fijo: logo + nombre del comercio + selector de tema claro/oscuro + carrito con contador.
- **Banner condicional** de "cerrado ahora / abre a las X", calculado en base a `horarios` (nunca texto fijo tipo "abrimos lunes a las 8:30" — se recalcula dinámicamente comparando la hora actual contra las franjas configuradas).
- **Hero** corto y opcional, usando los campos de `contenido`.
- **Nav de categorías** sticky (se mantiene visible al scrollear), generado dinámicamente desde la subcolección `categorias` del comercio — nunca hardcodeado.
- **Grid de productos**: 2 columnas en mobile, 3-4 en desktop. Cada card: imagen, nombre, precio, botón "+" para sumar al carrito directo desde la card, sin abrir modal (salvo que el producto tenga `variantes`, caso que queda reservado para una versión futura).
- **Carrito flotante** siempre visible, mostrando cantidad de items y total (recalculado con cualquier descuento por volumen que el comercio tenga activo).
- **Checkout en una sola pantalla o bottom-sheet** (no wizard de varios pasos): nombre, método de pago (selector poblado dinámicamente desde `comercio.configuracion.metodosPago`, filtrando solo los `activo: true` — nunca una lista fija hardcodeada de métodos), dirección/notas, botón final "Enviar pedido por WhatsApp".
- **Sección de ubicación**: mapa embebido + contacto + horarios.
- **Persistencia del carrito**: el estado del carrito debe guardarse en `localStorage`, con una clave que incluya el slug del tenant actual (ej. `carrito:{slug}`), para que no se pierda si el navegador recarga la página (frecuente en mobile por gestos de pull-to-refresh) o si el cliente cierra y vuelve a abrir la pestaña antes de confirmar el pedido.

---

## 8. Cálculo de precios y descuentos (genérico, no hardcodeado a ningún rubro)

```ts
interface ReglaDescuento { desdeCantidad: number; descuentoPorcentaje: number; }
interface ConfigDescuentos {
  activo: boolean;
  soloMetodosDePago: string[] | null;
  reglas: ReglaDescuento[];
}

function calcularDescuento(
  cantidadTotal: number,
  metodoPago: string,
  config?: ConfigDescuentos
): number {
  if (!config?.activo || !config.reglas?.length) return 0;
  if (config.soloMetodosDePago && !config.soloMetodosDePago.includes(metodoPago)) return 0;

  const reglaAplicable = [...config.reglas]
    .sort((a, b) => b.desdeCantidad - a.desdeCantidad)
    .find((r) => cantidadTotal >= r.desdeCantidad);

  return reglaAplicable?.descuentoPorcentaje ?? 0;
}
```

Cualquier texto de marketing que mencione el descuento (badges, subtítulos de hero) debe leer estos mismos valores de configuración en tiempo real — nunca copiar el porcentaje o los umbrales como texto estático, porque quedaría desactualizado apenas un comercio configure valores distintos.

---

## 9. Formateador de pedido para WhatsApp

```ts
interface ItemCarrito { nombre: string; cantidad: number; unidadMedida?: string; precio: number; }
interface DatosCliente { nombre: string; metodoPago: string; direccion?: string; notas?: string; }
interface ResumenPrecio { subtotal: number; descuentoPorcentaje: number; descuentoMonto: number; total: number; }

function generarLinkWhatsApp(numeroComercio: string, items: ItemCarrito[], cliente: DatosCliente, resumen: ResumenPrecio): string {
  const lineasProductos = items
    .map((item) => {
      const etiquetaCantidad = item.unidadMedida ? `${item.cantidad}${item.unidadMedida}` : `${item.cantidad}x`;
      return `${etiquetaCantidad} ${item.nombre} - $${(item.precio * item.cantidad).toLocaleString("es-AR")}`;
    })
    .join("\n");

  // Si hubo descuento, desglosarlo en líneas separadas — mostrar solo "Total" con un precio
  // ya rebajado genera desconfianza tanto en el cliente como en el comercio que lo recibe.
  const lineasTotal = resumen.descuentoPorcentaje > 0
    ? [
        `Subtotal: $${resumen.subtotal.toLocaleString("es-AR")}`,
        `Descuento por volumen (${resumen.descuentoPorcentaje}%): -$${resumen.descuentoMonto.toLocaleString("es-AR")}`,
        `Total Final: $${resumen.total.toLocaleString("es-AR")}`,
      ]
    : [`Total: $${resumen.total.toLocaleString("es-AR")}`];

  const mensaje = [
    "PEDIDO NUEVO",
    "",
    lineasProductos,
    "",
    ...lineasTotal,
    "",
    `Nombre: ${cliente.nombre}`,
    `Metodo de pago: ${cliente.metodoPago}`,
    cliente.direccion ? `Direccion de envio: ${cliente.direccion}` : "",
    cliente.notas ? `Notas: ${cliente.notas}` : "",
  ].filter((linea) => linea !== "").join("\n");

  const numeroLimpio = numeroComercio.replace(/\D/g, "");
  return `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensaje)}`;
}
```

Texto plano, sin emojis, con saltos de línea reales. Al confirmar, además de generar el link, guardar el pedido en `comercios/{slug}/pedidos` con estado `"pendiente"` para que el comercio lo vea en su panel.

---

## 10. Roles de administración — dos niveles distintos

Hay dos roles completamente separados, con paneles y permisos distintos:

- **Super admin**: dueño de la plataforma (vos). Se encarga de dar de alta comercios nuevos a nivel técnico (esqueleto mínimo). No administra el contenido/catálogo de cada comercio.
- **Admin de comercio**: el dueño de cada local. Una vez que su comercio fue creado por el super admin, hace login por primera vez, completa un onboarding de personalización, y desde ahí administra su catálogo, pedidos, estadísticas y presupuestos de forma 100% autónoma.

### 10.1 Login
- Autenticación por email/contraseña (Firebase Auth).
- Guard que valida, según el subdominio en el que está parado el usuario: que esté autenticado Y que exista en `comercios/{slug}/admins/{uid}` para ESE slug específico — un admin de un comercio no debe poder loguearse en el panel de otro comercio aunque tenga una cuenta válida de Firebase Auth.
- El panel de super admin vive en una ruta/subdominio reservado aparte (ej. `admin.midominio.com`), que el middleware reconoce como especial y no trata como el slug de un comercio más. Su guard valida contra `superAdmins/{uid}` en vez de `admins`.

### 10.2 Flujo de alta de un comercio nuevo (super admin → dueño del local)

**Paso 1 — Alta técnica (super admin, mínima)**
Desde el panel de super admin: slug, nombre del comercio, número de WhatsApp, email del primer administrador. Al crearse:
- El comercio queda con `activo: false` (no visible públicamente en su subdominio todavía).
- `onboardingCompletado: false`.
- Se crea el usuario en Firebase Auth (contraseña temporal o link de invitación) y su registro en `admins`.
- Categorías y productos arrancan completamente vacíos — nada pre-cargado ni clonado de otro comercio.

**Paso 2 — Onboarding de personalización (dueño del local)**
En su primer login, el dueño ve un wizard guiado (no el dashboard completo todavía) para completar lo mínimo necesario antes de publicar:
- Tema: paleta de colores (set cerrado) + fuente
- Logo
- Contenido del hero (título, descripción, badge)
- Horarios y contacto
- Unidades de venta que va a ofrecer (solo por unidad, o también algún formato fraccionado con su propia etiqueta)

**Paso 3 — Publicación**
Botón "Publicar mi tienda" que pone `activo: true`. Recién ahí el subdominio muestra el catálogo público. Si alguien entra a un subdominio con `activo: false`, debe ver una pantalla tipo "Esta tienda está en construcción", nunca un catálogo vacío o un error.

Después de este onboarding inicial, todo lo personalizable (tema, contenido, horarios, contacto, unidades de venta, descuentos) sigue editable en cualquier momento desde la sección Configuración del panel normal del comercio (10.7).

### 10.3 Pedidos
- Lista de pedidos generados vía el flujo de WhatsApp, filtrable por estado: Todos / Pendientes / Aceptados / Ignorados.
- Cada pedido muestra: número corto, fecha, método de pago, items, total.
- Acciones: aceptar / ignorar / restablecer a pendiente.

### 10.4 Estadísticas / Dashboard
- Filtro de período: Hoy / Este mes / Todo el tiempo.
- Métricas: pedidos aceptados, total facturado, descuentos otorgados, ticket promedio.
- Desglose por estado: pendientes / aceptados / ignorados.

### 10.5 Productos
- Tabla con búsqueda y **filtro por categoría** (dinámico, según las categorías que el propio comercio haya creado — no existe ningún filtro de "tipo" fijo ni enum cerrado).
- Columnas: nombre, categoría, precio, acciones (editar/eliminar, con confirmación antes de eliminar).
- **Formulario de alta/edición de producto**:
  - Nombre, descripción/resumen corto, imagen, código de barras (opcional, solo visible en admin).
  - **Categoría**: combobox con autocompletado — el admin elige una categoría existente o escribe un nombre nuevo y ve una opción "+ Crear categoría '[nombre]'". Si crea una nueva, se crea el documento en `categorias` y luego se guarda el producto con ese `categoriaId` — manejar esto para que si falla la creación de la categoría, el producto no quede guardado a medias (transacción de Firestore o manejo de error explícito que revierta el estado).
  - **Formato de venta**: si `comercio.configuracion.unidadesDeVentaDisponibles` tiene un solo valor, no se muestra ningún selector — el producto se guarda directo con ese `tipoVenta`. Si tiene más de un valor, se muestra un toggle con las etiquetas configuradas por ESE comercio (nunca hardcodear "Por litro" ni ninguna etiqueta fija en el componente).
  - Precio, y si el formato de venta elegido es fraccionado: unidad de medida (string libre), paso de incremento, cantidad mínima.
  - **Beneficios** (opcional): lista de bullets libres asociados a ese producto puntual (ej. "sin conservantes", "apto vegano", "hecho a mano") — array de strings libre, sin set cerrado, ya que varía mucho según el rubro del comercio. Distinto de `features` del comercio (que son bullets de marketing generales del negocio completo, no de un producto puntual).
  - Sin ningún campo de "Tipo de producto" separado de Categoría — sería una clasificación redundante.

### 10.6 Presupuestador
- Genera **cotizaciones no vinculantes** para un cliente potencial (aclarar en la UI que no son un comprobante fiscal ni una orden de compra confirmada).
- Formulario de generación: datos de cliente (nombre, teléfono opcional, notas), items del catálogo (buscables) o carga manual con descripción libre.
- Cálculo automático de subtotal, descuento (si aplica) y total.
- Vigencia opcional (ej. "válido por 7 días") — campo `validezDias`.
- Estado del presupuesto: borrador / enviado / aceptado / vencido, editable manualmente por el admin.
- Numeración automática correlativa por comercio.
- Vista previa exportable a PDF, pensada para poder enviarse directo por WhatsApp al cliente.

### 10.7 Configuración
- **Tema**: paleta de colores (set cerrado) y fuente.
- **Contenido**: textos del hero, features de marketing del negocio.
- **Horarios**: por día de la semana, franjas de apertura/cierre (puede haber más de una franja por día).
- **Contacto**: teléfono, dirección, ubicación en mapa (selección de coordenadas).
- **Métodos de pago**: lista editable de los métodos que este comercio acepta (nombre + activo/inactivo), que alimenta tanto el selector del checkout público como la restricción opcional de descuentos por volumen. Un comercio nuevo arranca con "Efectivo" activo por defecto, editable/ampliable desde acá.
- **Unidades de venta disponibles**: qué formatos de venta ofrece este comercio.
- **Descuentos por volumen**: activar/desactivar, tramos (cantidad mínima → porcentaje), restricción opcional a métodos de pago específicos.

### 10.8 Panel de Super Admin — [RESERVADO PARA FASE FUTURA, VER SECCIÓN 12]
**No generar código de UI para esta sección en la implementación inicial.** El alta de comercios en esta primera versión se resuelve exclusivamente con el script/Server Action descripto en la Sección 12 (Fase 0), ejecutado manualmente. Este apartado documenta únicamente el alcance funcional que tendría el panel de super admin **cuando se decida construirlo** (no antes), para que el modelo de datos (`superAdmins`, Security Rules) ya esté preparado sin que eso implique construir la interfaz ahora:
- Listado de comercios con su estado: en onboarding / publicado / inactivo.
- Formulario de alta rápida (slug, nombre, whatsapp, email del primer admin).
- Reenvío de invitación si el dueño todavía no completó su primer login.
- Sin acceso de edición al catálogo/contenido de cada comercio — esa responsabilidad es exclusiva del admin de cada local.

---

## 11. Landing page (dominio raíz, sin subdominio)

Página de marketing que vende la plataforma a comercios potenciales — completamente separada visualmente del catálogo de cualquier tenant, con su propia paleta fija (la marca del proyecto, no la de ningún comercio).

Secciones: Header con CTA a demo, Hero orientado a resultado (no a tecnología), Cómo funciona (3-4 pasos), Diferenciales (sin comisión por venta, cliente no necesita cuenta, comercio sigue cerrando por WhatsApp, panel propio, personalización sin código), sección con link a la demo en vivo, Pricing (formato "contanos tu caso" si todavía no hay precios fijos), Contacto final con CTA a WhatsApp, Footer.

Requiere SSR para SEO (a diferencia del panel admin) y meta tags configurables (title, description, og:image) para que se vea bien al compartir el link por WhatsApp.

---

## 12. Alta de comercios (Fase 0 — Server Action/script, no panel completo todavía)

Para el volumen inicial (pocos comercios, venta directa), no construir un panel de super-admin completo (ver nota en Sección 10.8). Empezar con una Next.js Server Action o script de Node standalone, ambos usando Firebase Admin SDK:

```
crearComercio(slug, nombre, whatsappNumero, emailAdmin, passwordTemporal)
```

Que valide que el slug no esté tomado, cree el documento `comercios/{slug}` con estos defaults seguros para cualquier rubro:
- `activo: false`, `onboardingCompletado: false`
- `configuracion.unidadesDeVentaDisponibles: [{valor:"unidad",etiqueta:"Por unidad"}]`
- `configuracion.metodosPago: [{id:"efectivo",nombre:"Efectivo",activo:true}]`
- `configuracion.descuentosPorVolumen.activo: false`

Y cree el usuario en Firebase Auth y su documento en `admins`. Categorías y productos quedan vacíos — el propio comercio los carga desde su panel durante el onboarding.

Este proceso puede migrar más adelante al panel de super admin descripto en la Sección 10.8, cuando el volumen de altas lo justifique — no construir esa UI todavía.

---

## 13. Tenant de demo

Cargar un comercio de demostración con datos ficticios completos y realistas (nombre de fantasía, productos con precios creíbles, categorías, horarios, ubicación), con el flujo de WhatsApp apuntando a un número de testing controlado por el equipo del proyecto — nunca a un número roto o de un tercero.

---

## Antes de empezar a escribir código

Mostrame:
1. La estructura de carpetas/proyecto que proponés para separar landing / catálogo multi-tenant / panel admin dentro del mismo proyecto Next.js.
2. Cualquier duda sobre algo de este documento que necesites resolver antes de arrancar.
3. Un plan de fases sugerido para construir esto de forma incremental (qué armar primero para tener algo testeable cuanto antes).
