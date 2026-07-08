"use server";

import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { calcularResumenPrecio } from "@/core/dominio/descuentos";
import { generarNumeroCorto } from "@/core/dominio/numeroCorto";
import { armarItemsPedido } from "@/core/dominio/pedidos";
import { generarLinkWhatsApp } from "@/core/dominio/whatsapp";
import { adminDb } from "@/core/firebase/admin";
import { obtenerComercio } from "@/features/comercio/datos";
import type { DatosCliente, Producto } from "@/core/types";

const EsquemaPedido = z.object({
  slug: z.string().min(1).max(100),
  items: z
    .array(
      z.object({
        productoId: z.string().min(1).max(200),
        cantidad: z.number().positive().finite().max(999),
      }),
    )
    .min(1)
    .max(50),
  cliente: z.object({
    nombre: z.string().trim().min(1, "Ingresá tu nombre.").max(100),
    metodoPago: z.string().min(1).max(50),
    direccion: z.string().trim().max(300).optional(),
    notas: z.string().trim().max(500).optional(),
  }),
});

export type ResultadoCrearPedido =
  | { ok: true; url: string; numeroCorto: string }
  | { ok: false; error: string };

/**
 * Registra el pedido y devuelve el link de WhatsApp. Corre con Admin SDK y
 * recalcula precios, descuentos y totales desde la base: nada de lo que
 * viene del navegador se toma como valor monetario.
 */
export async function crearPedido(entrada: unknown): Promise<ResultadoCrearPedido> {
  const parseado = EsquemaPedido.safeParse(entrada);
  if (!parseado.success) {
    const issue = parseado.error.issues[0];
    const error = issue?.path.includes("nombre") ? issue.message : "Revisá los datos del pedido.";
    return { ok: false, error };
  }
  const { slug, items: itemsCliente, cliente } = parseado.data;

  const comercio = await obtenerComercio(slug);
  if (!comercio?.activo) return { ok: false, error: "La tienda no está disponible." };

  const metodo = comercio.configuracion.metodosPago.find(
    (candidato) => candidato.id === cliente.metodoPago && candidato.activo,
  );
  if (!metodo) return { ok: false, error: "Elegí un método de pago válido." };

  const referencias = itemsCliente.map((item) =>
    adminDb.doc(`comercios/${slug}/productos/${item.productoId}`),
  );
  const snapshots = await adminDb.getAll(...referencias);
  const productos = new Map(
    snapshots
      .filter((snapshot) => snapshot.exists)
      .map((snapshot) => [snapshot.id, { id: snapshot.id, ...snapshot.data() } as Producto]),
  );

  const resultado = armarItemsPedido(itemsCliente, productos);
  if (!resultado.ok) return resultado;

  const resumen = calcularResumenPrecio(
    resultado.items.map((item) => ({ cantidad: item.cantidad, precio: item.precioUnitario })),
    metodo.id,
    comercio.configuracion.descuentosPorVolumen,
  );

  const datosCliente: DatosCliente = {
    nombre: cliente.nombre,
    metodoPago: metodo.nombre,
    ...(cliente.direccion ? { direccion: cliente.direccion } : {}),
    ...(cliente.notas ? { notas: cliente.notas } : {}),
  };

  const numeroCorto = generarNumeroCorto();
  await adminDb.collection(`comercios/${slug}/pedidos`).add({
    items: resultado.items,
    total: resumen.total,
    descuentoAplicado: resumen.descuentoMonto,
    datosCliente,
    estado: "pendiente",
    createdAt: FieldValue.serverTimestamp(),
    numeroCorto,
  });

  const url = generarLinkWhatsApp(
    comercio.whatsappNumero,
    resultado.itemsMensaje,
    datosCliente,
    resumen,
  );
  return { ok: true, url, numeroCorto };
}
