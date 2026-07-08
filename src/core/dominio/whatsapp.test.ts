import { describe, expect, it } from "vitest";
import { generarLinkWhatsApp } from "@/core/dominio/whatsapp";
import type { DatosCliente, ItemCarrito, ResumenPrecio } from "@/core/types";

const items: ItemCarrito[] = [
  { productoId: "p1", nombre: "Hamburguesa Completa", cantidad: 2, precio: 4500 },
  { productoId: "p2", nombre: "Cerveza Artesanal", cantidad: 1.5, unidadMedida: "litro", precio: 3000 },
];

const cliente: DatosCliente = { nombre: "Juan", metodoPago: "Efectivo" };

const sinDescuento: ResumenPrecio = {
  subtotal: 13500,
  descuentoPorcentaje: 0,
  descuentoMonto: 0,
  total: 13500,
};

const conDescuento: ResumenPrecio = {
  subtotal: 13500,
  descuentoPorcentaje: 10,
  descuentoMonto: 1350,
  total: 12150,
};

const textoDelLink = (link: string) => new URL(link).searchParams.get("text");

describe("generarLinkWhatsApp", () => {
  it("apunta a wa.me con el número limpio, solo dígitos", () => {
    const link = generarLinkWhatsApp("+54 9 351 123-4567", items, cliente, sinDescuento);
    expect(link.startsWith("https://wa.me/5493511234567?text=")).toBe(true);
  });

  it("arma el mensaje en texto plano con precios formato es-AR", () => {
    const link = generarLinkWhatsApp("5493511234567", items, cliente, sinDescuento);
    expect(textoDelLink(link)).toBe(
      [
        "PEDIDO NUEVO",
        "",
        "2x Hamburguesa Completa - $9.000",
        "1,5litro Cerveza Artesanal - $4.500",
        "",
        "Total: $13.500",
        "",
        "Nombre: Juan",
        "Metodo de pago: Efectivo",
      ].join("\n"),
    );
  });

  it("desglosa el descuento en líneas separadas cuando aplica", () => {
    const link = generarLinkWhatsApp("5493511234567", items, cliente, conDescuento);
    expect(textoDelLink(link)).toBe(
      [
        "PEDIDO NUEVO",
        "",
        "2x Hamburguesa Completa - $9.000",
        "1,5litro Cerveza Artesanal - $4.500",
        "",
        "Subtotal: $13.500",
        "Descuento por volumen (10%): -$1.350",
        "Total Final: $12.150",
        "",
        "Nombre: Juan",
        "Metodo de pago: Efectivo",
      ].join("\n"),
    );
  });

  it("incluye dirección y notas solo si están presentes", () => {
    const completo = generarLinkWhatsApp(
      "549",
      items,
      { ...cliente, direccion: "Av. Siempre Viva 123", notas: "Sin cebolla" },
      sinDescuento,
    );
    const texto = textoDelLink(completo)!;
    expect(texto).toContain("Direccion de envio: Av. Siempre Viva 123");
    expect(texto).toContain("Notas: Sin cebolla");

    const minimo = textoDelLink(generarLinkWhatsApp("549", items, cliente, sinDescuento))!;
    expect(minimo).not.toContain("Direccion de envio:");
    expect(minimo).not.toContain("Notas:");
  });
});
