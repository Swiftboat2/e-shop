import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { crearPedido } from "@/features/pedidos/acciones";

// Test de integración real contra el emulador de Firestore.
// Si el emulador no está corriendo, la suite se saltea (no falla).
const emuladorDisponible = await fetch("http://127.0.0.1:8080", {
  signal: AbortSignal.timeout(500),
})
  .then((respuesta) => respuesta.ok)
  .catch(() => false);

const SLUG = "test-pedidos";

describe.skipIf(!emuladorDisponible)("crearPedido (contra emulador)", () => {
  beforeAll(async () => {
    const { adminDb } = await import("@/core/firebase/admin");
    const batch = adminDb.batch();

    batch.set(adminDb.doc(`comercios/${SLUG}`), {
      nombre: "Comercio de Prueba",
      logoUrl: "",
      whatsappNumero: "5491100000000",
      activo: true,
      onboardingCompletado: true,
      plan: "test",
      timezone: "America/Argentina/Buenos_Aires",
      createdAt: new Date(),
      tema: { colorPrimario: "#000", colorSecundario: "#111", colorFondo: "#fff", colorTexto: "#000", fuente: "inter" },
      contenido: { heroTitulo: "", heroTituloDestacado: "", heroDescripcion: "", heroBadge: "" },
      features: [],
      contacto: { telefono: "", direccion: "", mapLat: 0, mapLng: 0 },
      horarios: [],
      configuracion: {
        metodosPago: [
          { id: "efectivo", nombre: "Efectivo", activo: true },
          { id: "transferencia", nombre: "Transferencia", activo: true },
          { id: "tarjeta", nombre: "Tarjeta", activo: false },
        ],
        unidadesDeVentaDisponibles: [{ valor: "unidad", etiqueta: "Por unidad" }],
        descuentosPorVolumen: {
          activo: true,
          soloMetodosDePago: ["efectivo"],
          reglas: [{ desdeCantidad: 10, descuentoPorcentaje: 10 }],
        },
      },
    });
    batch.set(adminDb.doc(`comercios/${SLUG}/productos/prod-a`), {
      nombre: "Producto A",
      descripcion: "",
      imagenUrl: "",
      disponible: true,
      orden: 1,
      categoriaId: "c1",
      tipoVenta: "unidad",
      precio: 100,
    });
    batch.set(adminDb.doc(`comercios/${SLUG}/productos/prod-granel`), {
      nombre: "Producto a Granel",
      descripcion: "",
      imagenUrl: "",
      disponible: true,
      orden: 2,
      categoriaId: "c1",
      tipoVenta: "fraccionado",
      precio: 2000,
      unidadMedida: "kg",
      pasoIncremento: 0.5,
      cantidadMinima: 1,
    });
    batch.set(adminDb.doc(`comercios/${SLUG}/productos/prod-off`), {
      nombre: "Producto Apagado",
      descripcion: "",
      imagenUrl: "",
      disponible: false,
      orden: 3,
      categoriaId: "c1",
      tipoVenta: "unidad",
      precio: 100,
    });

    await batch.commit();
  });

  afterAll(async () => {
    const { adminDb } = await import("@/core/firebase/admin");
    await adminDb.recursiveDelete(adminDb.doc(`comercios/${SLUG}`));
  });

  // headers() no corre en un request real acá: obtenerIpCliente cae siempre
  // a "desconocida", así que sin este reset el rate limit de crearPedido
  // (pensado para frenar spam desde una sola IP) terminaría bloqueando los
  // demás tests de este archivo entre sí (y, entre corridas sucesivas, con
  // el estado que haya quedado en el emulador de una corrida anterior).
  beforeEach(async () => {
    const { adminDb } = await import("@/core/firebase/admin");
    await Promise.all([
      adminDb.doc(`comercios/${SLUG}/limitesPedidos/desconocida`).delete(),
      adminDb.doc("comercios/no-existe/limitesPedidos/desconocida").delete(),
    ]);
  });

  it("registra el pedido recalculando totales server-side y devuelve el link", async () => {
    const resultado = await crearPedido({
      slug: SLUG,
      items: [{ productoId: "prod-a", cantidad: 12 }],
      cliente: { nombre: "Juana", metodoPago: "efectivo", notas: "Timbre roto" },
    });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.url.startsWith("https://wa.me/5491100000000?text=")).toBe(true);
    const texto = new URL(resultado.url).searchParams.get("text")!;
    expect(texto).toContain("12x Producto A - $1.200");
    expect(texto).toContain("Descuento por volumen (10%): -$120");
    expect(texto).toContain("Total Final: $1.080");
    expect(texto).toContain("Notas: Timbre roto");

    const { adminDb } = await import("@/core/firebase/admin");
    const pedidos = await adminDb.collection(`comercios/${SLUG}/pedidos`).get();
    const pedido = pedidos.docs
      .map((doc) => doc.data())
      .find((data) => data.numeroCorto === resultado.numeroCorto)!;

    expect(pedido).toBeDefined();
    expect(pedido.total).toBe(1080);
    expect(pedido.descuentoAplicado).toBe(120);
    expect(pedido.estado).toBe("pendiente");
    expect(pedido.items[0].precioUnitario).toBe(100);
    expect(pedido.numeroCorto).toMatch(/^P-/);
  });

  it("no aplica el descuento cuando el método de pago no está en la restricción", async () => {
    const resultado = await crearPedido({
      slug: SLUG,
      items: [{ productoId: "prod-a", cantidad: 12 }],
      cliente: { nombre: "Juana", metodoPago: "transferencia" },
    });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;
    const texto = new URL(resultado.url).searchParams.get("text")!;
    expect(texto).toContain("Total: $1.200");
    expect(texto).not.toContain("Descuento");
  });

  it("rechaza métodos de pago inactivos o desconocidos", async () => {
    for (const metodoPago of ["tarjeta", "cripto"]) {
      const resultado = await crearPedido({
        slug: SLUG,
        items: [{ productoId: "prod-a", cantidad: 1 }],
        cliente: { nombre: "Juana", metodoPago },
      });
      expect(resultado).toEqual({ ok: false, error: "Elegí un método de pago válido." });
    }
  });

  it("rechaza productos no disponibles y cantidades bajo el mínimo", async () => {
    const apagado = await crearPedido({
      slug: SLUG,
      items: [{ productoId: "prod-off", cantidad: 1 }],
      cliente: { nombre: "Juana", metodoPago: "efectivo" },
    });
    expect(apagado.ok).toBe(false);

    const bajoMinimo = await crearPedido({
      slug: SLUG,
      items: [{ productoId: "prod-granel", cantidad: 0.5 }],
      cliente: { nombre: "Juana", metodoPago: "efectivo" },
    });
    expect(bajoMinimo).toEqual({
      ok: false,
      error: "La cantidad mínima de Producto a Granel es 1.",
    });
  });

  it("rechaza el pedido sin nombre y las tiendas inexistentes", async () => {
    const sinNombre = await crearPedido({
      slug: SLUG,
      items: [{ productoId: "prod-a", cantidad: 1 }],
      cliente: { nombre: "  ", metodoPago: "efectivo" },
    });
    expect(sinNombre).toEqual({ ok: false, error: "Ingresá tu nombre." });

    const fantasma = await crearPedido({
      slug: "no-existe",
      items: [{ productoId: "prod-a", cantidad: 1 }],
      cliente: { nombre: "Juana", metodoPago: "efectivo" },
    });
    expect(fantasma).toEqual({ ok: false, error: "La tienda no está disponible." });
  });

  it("bloquea pedidos repetidos desde el mismo origen dentro de la ventana", async () => {
    const pedido = () =>
      crearPedido({
        slug: SLUG,
        items: [{ productoId: "prod-a", cantidad: 1 }],
        cliente: { nombre: "Juana", metodoPago: "efectivo" },
      });

    // MAXIMO_PEDIDOS_POR_VENTANA es 3: los primeros tres entran.
    expect((await pedido()).ok).toBe(true);
    expect((await pedido()).ok).toBe(true);
    expect((await pedido()).ok).toBe(true);

    const cuarto = await pedido();
    expect(cuarto).toEqual({
      ok: false,
      error: "Estás enviando pedidos muy seguido. Esperá unos minutos y probá de nuevo.",
    });
  });
});
