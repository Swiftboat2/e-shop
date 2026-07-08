"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { calcularResumenPrecio } from "@/core/dominio/descuentos";
import { carritoReducer, type ItemDelCarrito } from "./reducer";
import type { ConfigDescuentos, MetodoPago, Producto, ResumenPrecio } from "@/core/types";

interface ValorCarrito {
  items: ItemDelCarrito[];
  abierto: boolean;
  abrir: () => void;
  cerrar: () => void;
  agregar: (producto: Producto) => void;
  incrementar: (productoId: string) => void;
  quitar: (productoId: string) => void;
  vaciar: () => void;
  resumenPara: (metodoPago: string) => ResumenPrecio;
  metodosPago: MetodoPago[];
  slug: string;
}

const CarritoContext = createContext<ValorCarrito | undefined>(undefined);

function esItemValido(item: unknown): item is ItemDelCarrito {
  if (typeof item !== "object" || item === null) return false;
  const candidato = item as Record<string, unknown>;
  return (
    typeof candidato.productoId === "string" &&
    typeof candidato.nombre === "string" &&
    typeof candidato.precio === "number" &&
    typeof candidato.cantidad === "number" &&
    typeof candidato.paso === "number" &&
    typeof candidato.minimo === "number"
  );
}

export function CarritoProvider({
  slug,
  metodosPago,
  descuentos,
  children,
}: {
  slug: string;
  metodosPago: MetodoPago[];
  descuentos: ConfigDescuentos;
  children: React.ReactNode;
}) {
  const [items, dispatch] = useReducer(carritoReducer, []);
  const [abierto, setAbierto] = useState(false);

  const claveStorage = `carrito:${slug}`;

  // Restaura el carrito guardado: sobrevive recargas (pull-to-refresh en
  // mobile) y pestañas cerradas antes de confirmar el pedido.
  useEffect(() => {
    try {
      const crudo = localStorage.getItem(claveStorage);
      if (crudo) {
        const parseado: unknown = JSON.parse(crudo);
        if (Array.isArray(parseado)) {
          dispatch({ tipo: "cargar", items: parseado.filter(esItemValido) });
        }
      }
    } catch {
      // Carrito corrupto: se arranca vacío.
    }
  }, [claveStorage]);

  // La primera pasada se saltea: se guarda recién a partir de cambios reales,
  // para no pisar el carrito guardado con el estado inicial vacío.
  const primeraEscritura = useRef(true);
  useEffect(() => {
    if (primeraEscritura.current) {
      primeraEscritura.current = false;
      return;
    }
    localStorage.setItem(claveStorage, JSON.stringify(items));
  }, [items, claveStorage]);

  const agregar = useCallback(
    (producto: Producto) => dispatch({ tipo: "agregar", producto }),
    [],
  );
  const incrementar = useCallback(
    (productoId: string) => dispatch({ tipo: "incrementar", productoId }),
    [],
  );
  const quitar = useCallback(
    (productoId: string) => dispatch({ tipo: "quitar", productoId }),
    [],
  );
  const vaciar = useCallback(() => dispatch({ tipo: "vaciar" }), []);
  const abrir = useCallback(() => setAbierto(true), []);
  const cerrar = useCallback(() => setAbierto(false), []);

  const resumenPara = useCallback(
    (metodoPago: string) => calcularResumenPrecio(items, metodoPago, descuentos),
    [items, descuentos],
  );

  const valor = useMemo(
    () => ({
      items,
      abierto,
      abrir,
      cerrar,
      agregar,
      incrementar,
      quitar,
      vaciar,
      resumenPara,
      metodosPago,
      slug,
    }),
    [items, abierto, abrir, cerrar, agregar, incrementar, quitar, vaciar, resumenPara, metodosPago, slug],
  );

  return <CarritoContext.Provider value={valor}>{children}</CarritoContext.Provider>;
}

export function useCarrito(): ValorCarrito {
  const contexto = useContext(CarritoContext);
  if (!contexto) throw new Error("useCarrito debe usarse dentro de CarritoProvider");
  return contexto;
}
