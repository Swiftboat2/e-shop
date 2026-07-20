// Carga el tenant de demo (y uno "en obra" para probar el gate de publicación)
// contra los emuladores. Idempotente: usa IDs fijos y sobreescribe.
// Uso: npm run seed:demo (con los emuladores corriendo).

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.error("Este seed es solo para emuladores: hay un service account configurado. Abortando.");
  process.exit(1);
}

process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099";

const { initializeApp } = await import("firebase-admin/app");
const { getAuth } = await import("firebase-admin/auth");
const { getFirestore } = await import("firebase-admin/firestore");

const app = initializeApp({ projectId: "demo-eshop" });
const db = getFirestore(app);
const auth = getAuth(app);

// Acceso al panel del tenant demo.
const ADMIN_DEMO = { email: "admin@demo.test", password: "DemoAdmin123" };

// TODO: reemplazar por el número de WhatsApp de testing del proyecto.
const WHATSAPP_TESTING = "5490000000000";

const demo = {
  nombre: "Almacén Aurora",
  logoUrl: "",
  whatsappNumero: WHATSAPP_TESTING,
  activo: true,
  onboardingCompletado: true,
  plan: "demo",
  timezone: "America/Argentina/Buenos_Aires",
  createdAt: new Date(),
  // Paleta "Mercado" + combo "Cálida" del set cerrado (features/comercio/opciones.ts).
  tema: {
    colorPrimario: "#C1440E",
    colorSecundario: "#2B4C3F",
    colorFondo: "#FAF7F2",
    colorTexto: "#2B2620",
    fuente: "calida",
  },
  contenido: {
    heroBadge: "10% off en efectivo desde 10 unidades",
    heroTitulo: "Todo lo natural,",
    heroTituloDestacado: "a un mensaje de distancia",
    heroDescripcion:
      "Almacén natural y dietética. Armá tu pedido online y confirmalo por WhatsApp: te lo preparamos en el día.",
  },
  features: [
    { icono: "envio", texto: "Envíos en el día en toda la zona" },
    { icono: "calidad", texto: "Productos seleccionados, sin conservantes" },
    { icono: "pago", texto: "Pagá en efectivo o por transferencia" },
  ],
  contacto: {
    telefono: "+54 351 000-0000",
    direccion: "Av. Colón 1234, Córdoba",
    mapLat: -31.4135,
    mapLng: -64.1811,
  },
  horarios: [
    ...[1, 2, 3, 4, 5].flatMap((dia) => [
      { dia, apertura: "08:30", cierre: "13:00" },
      { dia, apertura: "17:00", cierre: "20:30" },
    ]),
    { dia: 6, apertura: "09:00", cierre: "13:00" },
  ],
  configuracion: {
    metodosPago: [
      { id: "efectivo", nombre: "Efectivo", activo: true },
      { id: "transferencia", nombre: "Transferencia", activo: true },
    ],
    unidadesDeVentaDisponibles: [
      { valor: "unidad", etiqueta: "Por unidad" },
      { valor: "kg", etiqueta: "Por kilo" },
      { valor: "litro", etiqueta: "Por litro" },
    ],
    descuentosPorVolumen: {
      activo: true,
      soloMetodosDePago: ["efectivo"],
      reglas: [
        { desdeCantidad: 10, descuentoPorcentaje: 10 },
        { desdeCantidad: 20, descuentoPorcentaje: 15 },
      ],
    },
  },
};

const categorias = [
  { id: "almacen", nombre: "Almacén", orden: 1, activo: true },
  { id: "frutos-secos", nombre: "Frutos Secos", orden: 2, activo: true },
  { id: "bebidas", nombre: "Bebidas", orden: 3, activo: true },
  { id: "limpieza", nombre: "Limpieza", orden: 4, activo: true },
];

const productos = [
  {
    id: "yerba-organica",
    nombre: "Yerba Mate Orgánica 1kg",
    descripcion: "Secado natural, sin humo. Cosecha 2026.",
    categoriaId: "almacen",
    tipoVenta: "unidad",
    precio: 8500,
    orden: 1,
  },
  {
    id: "aceite-oliva",
    nombre: "Aceite de Oliva Extra Virgen 500ml",
    descripcion: "Primera prensada en frío, de Cruz del Eje.",
    categoriaId: "almacen",
    tipoVenta: "unidad",
    precio: 12000,
    orden: 2,
  },
  {
    id: "miel-pura",
    nombre: "Miel Pura de Monte 500g",
    descripcion: "Sin pasteurizar, directa del productor.",
    categoriaId: "almacen",
    tipoVenta: "unidad",
    precio: 6800,
    beneficios: ["Sin agregados", "Origen serrano"],
    orden: 3,
  },
  {
    id: "turron-artesanal",
    nombre: "Turrón Artesanal",
    descripcion: "Producto fuera de temporada.",
    categoriaId: "almacen",
    tipoVenta: "unidad",
    precio: 4200,
    disponible: false,
    orden: 4,
  },
  {
    id: "almendras",
    nombre: "Almendras Nonpareil",
    descripcion: "Crocantes, ideales para snack o repostería.",
    categoriaId: "frutos-secos",
    tipoVenta: "fraccionado",
    precio: 28000,
    unidadMedida: "kg",
    pasoIncremento: 0.25,
    cantidadMinima: 0.25,
    beneficios: ["Sin conservantes", "Selección premium"],
    orden: 1,
  },
  {
    id: "nueces-peladas",
    nombre: "Nueces Peladas Mariposa",
    descripcion: "Livianas y frescas, de Catamarca.",
    categoriaId: "frutos-secos",
    tipoVenta: "fraccionado",
    precio: 22000,
    unidadMedida: "kg",
    pasoIncremento: 0.25,
    cantidadMinima: 0.25,
    orden: 2,
  },
  {
    id: "mix-tropical",
    nombre: "Mix Tropical",
    descripcion: "Frutos secos, pasas y coco tostado.",
    categoriaId: "frutos-secos",
    tipoVenta: "fraccionado",
    precio: 18500,
    unidadMedida: "kg",
    pasoIncremento: 0.5,
    cantidadMinima: 0.5,
    orden: 3,
  },
  {
    id: "jugo-naranja",
    nombre: "Jugo de Naranja Exprimido",
    descripcion: "Exprimido en el día, sin azúcar agregada.",
    categoriaId: "bebidas",
    tipoVenta: "fraccionado",
    precio: 4500,
    unidadMedida: "litro",
    pasoIncremento: 0.5,
    cantidadMinima: 1,
    orden: 1,
  },
  {
    id: "kombucha-jengibre",
    nombre: "Kombucha de Jengibre 500ml",
    descripcion: "Fermentación natural, bien burbujeante.",
    categoriaId: "bebidas",
    tipoVenta: "unidad",
    precio: 5500,
    beneficios: ["Fermentación natural"],
    orden: 2,
  },
  {
    id: "detergente-granel",
    nombre: "Detergente Ecológico a Granel",
    descripcion: "Traé tu envase y recargá.",
    categoriaId: "limpieza",
    tipoVenta: "fraccionado",
    precio: 3800,
    unidadMedida: "litro",
    pasoIncremento: 0.5,
    cantidadMinima: 1,
    orden: 1,
  },
  {
    id: "jabon-liquido",
    nombre: "Jabón Líquido para Ropa a Granel",
    descripcion: "Hipoalergénico, rinde el doble.",
    categoriaId: "limpieza",
    tipoVenta: "fraccionado",
    precio: 5200,
    unidadMedida: "litro",
    pasoIncremento: 1,
    cantidadMinima: 1,
    orden: 2,
  },
];

const enObra = {
  ...demo,
  nombre: "Ferretería El Tornillo",
  activo: false,
  onboardingCompletado: false,
  plan: "estandar",
  contenido: { heroBadge: "", heroTitulo: "", heroTituloDestacado: "", heroDescripcion: "" },
  features: [],
  horarios: [],
  configuracion: {
    metodosPago: [{ id: "efectivo", nombre: "Efectivo", activo: true }],
    unidadesDeVentaDisponibles: [{ valor: "unidad", etiqueta: "Por unidad" }],
    descuentosPorVolumen: { activo: false, soloMetodosDePago: null, reglas: [] },
  },
};

(async () => {
  const batch = db.batch();

  batch.set(db.doc("comercios/demo"), demo);
  for (const { id, ...categoria } of categorias) {
    batch.set(db.doc(`comercios/demo/categorias/${id}`), categoria);
  }
  for (const { id, ...producto } of productos) {
    batch.set(db.doc(`comercios/demo/productos/${id}`), {
      imagenUrl: "",
      disponible: true,
      ...producto,
    });
  }
  batch.set(db.doc("comercios/en-obra"), enObra);

  // Pedidos de ejemplo con estados variados, para que el panel muestre datos.
  const horasAtras = (horas) => new Date(Date.now() - horas * 3600 * 1000);
  const pedidosEjemplo = [
    {
      id: "demo-1",
      numeroCorto: "P-DM4K2",
      estado: "pendiente",
      createdAt: horasAtras(1),
      items: [
        { productoId: "yerba-organica", nombre: "Yerba Mate Orgánica 1kg", cantidad: 2, precioUnitario: 8500, subtotal: 17000 },
        { productoId: "almendras", nombre: "Almendras Nonpareil", cantidad: 0.5, precioUnitario: 28000, subtotal: 14000 },
      ],
      total: 31000,
      descuentoAplicado: 0,
      datosCliente: { nombre: "Carla", metodoPago: "Efectivo", direccion: "9 de Julio 555" },
    },
    {
      id: "demo-2",
      numeroCorto: "P-XR8T3",
      estado: "aceptado",
      createdAt: horasAtras(26),
      items: [
        { productoId: "aceite-oliva", nombre: "Aceite de Oliva Extra Virgen 500ml", cantidad: 1, precioUnitario: 12000, subtotal: 12000 },
      ],
      total: 12000,
      descuentoAplicado: 0,
      datosCliente: { nombre: "Marcos", metodoPago: "Transferencia", notas: "Paso a buscarlo a las 18" },
    },
    {
      id: "demo-3",
      numeroCorto: "P-QN5W7",
      estado: "ignorado",
      createdAt: horasAtras(50),
      items: [
        { productoId: "kombucha-jengibre", nombre: "Kombucha de Jengibre 500ml", cantidad: 2, precioUnitario: 5500, subtotal: 11000 },
      ],
      total: 11000,
      descuentoAplicado: 0,
      datosCliente: { nombre: "Sofía", metodoPago: "Efectivo" },
    },
  ];
  for (const { id, ...pedido } of pedidosEjemplo) {
    batch.set(db.doc(`comercios/demo/pedidos/${id}`), pedido);
  }

  await batch.commit();

  let usuarioDemo = await auth.getUserByEmail(ADMIN_DEMO.email).catch(() => null);
  usuarioDemo ??= await auth.createUser(ADMIN_DEMO);
  await db.doc(`comercios/demo/admins/${usuarioDemo.uid}`).set({
    email: ADMIN_DEMO.email,
    rol: "owner",
    createdAt: new Date(),
  });

  console.log(
    `Seed listo: comercios/demo (${categorias.length} categorías, ${productos.length} productos, ${pedidosEjemplo.length} pedidos) y comercios/en-obra (activo: false).`,
  );
  console.log(`Panel demo: http://demo.localhost:3000/admin — ${ADMIN_DEMO.email} / ${ADMIN_DEMO.password}`);
  process.exit(0);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
