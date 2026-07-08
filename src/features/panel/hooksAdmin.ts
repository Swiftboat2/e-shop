"use client";

import { useEffect, useState } from "react";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/core/firebase/client";
import type { Categoria, Pedido, Presupuesto, Producto } from "@/core/types";

// Suscripciones en vivo para el panel: cualquier cambio (un pedido que entra,
// un producto guardado) se refleja sin recargar. Las Security Rules son las
// que garantizan que solo el admin del comercio pueda leer pedidos.

export function useProductosAdmin(slug: string) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const consulta = query(collection(db, "comercios", slug, "productos"), orderBy("orden"));
    return onSnapshot(consulta, (snapshot) => {
      setProductos(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Producto));
      setCargando(false);
    });
  }, [slug]);

  return { productos, cargando };
}

export function useCategoriasAdmin(slug: string) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    const consulta = query(collection(db, "comercios", slug, "categorias"), orderBy("orden"));
    return onSnapshot(consulta, (snapshot) => {
      setCategorias(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Categoria));
    });
  }, [slug]);

  return { categorias };
}

export function usePedidosAdmin(slug: string) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const consulta = query(
      collection(db, "comercios", slug, "pedidos"),
      orderBy("createdAt", "desc"),
      limit(500),
    );
    return onSnapshot(consulta, (snapshot) => {
      setPedidos(
        snapshot.docs.map((doc) => {
          const datos = doc.data();
          return {
            ...datos,
            id: doc.id,
            createdAt: (datos.createdAt as Timestamp | null)?.toDate() ?? new Date(0),
          } as Pedido;
        }),
      );
      setCargando(false);
    });
  }, [slug]);

  return { pedidos, cargando };
}

export function usePresupuestosAdmin(slug: string) {
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const consulta = query(
      collection(db, "comercios", slug, "presupuestos"),
      orderBy("numero", "desc"),
      limit(200),
    );
    return onSnapshot(consulta, (snapshot) => {
      setPresupuestos(
        snapshot.docs.map((doc) => {
          const datos = doc.data();
          return {
            ...datos,
            id: doc.id,
            createdAt: (datos.createdAt as Timestamp | null)?.toDate() ?? new Date(0),
          } as Presupuesto;
        }),
      );
      setCargando(false);
    });
  }, [slug]);

  return { presupuestos, cargando };
}
