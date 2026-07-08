"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EditorContacto } from "./editores/EditorContacto";
import { EditorContenido } from "./editores/EditorContenido";
import { EditorHorarios } from "./editores/EditorHorarios";
import { EditorTema } from "./editores/EditorTema";
import { EditorUnidades } from "./editores/EditorUnidades";
import { SubidaLogo } from "./editores/SubidaLogo";
import { actualizarComercio } from "./mutaciones";
import type { Comercio } from "@/core/types";

const PASOS = [
  { titulo: "Tu marca", descripcion: "Elegí los colores y la tipografía de tu tienda, y subí tu logo." },
  { titulo: "Los textos de tu portada", descripcion: "Lo primero que ve un cliente al entrar. Corto y al punto." },
  { titulo: "Horarios y contacto", descripcion: "Para el cartel de abierto/cerrado y la sección de ubicación." },
  { titulo: "Formatos de venta", descripcion: "¿Vendés solo por unidad, o también a granel o por medida?" },
];

export function Onboarding({ slug, comercio }: { slug: string; comercio: Comercio }) {
  const router = useRouter();
  const [paso, setPaso] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tema, setTema] = useState(comercio.tema);
  const [contenido, setContenido] = useState(comercio.contenido);
  const [horarios, setHorarios] = useState(comercio.horarios);
  const [contacto, setContacto] = useState(comercio.contacto);
  const [unidades, setUnidades] = useState(comercio.configuracion.unidadesDeVentaDisponibles);

  const esUltimo = paso === PASOS.length - 1;

  const continuar = async () => {
    setGuardando(true);
    setError(null);

    const payloadPorPaso: Record<string, unknown>[] = [
      { tema },
      { contenido },
      { horarios, contacto },
      { "configuracion.unidadesDeVentaDisponibles": unidades, onboardingCompletado: true },
    ];

    try {
      await actualizarComercio(slug, payloadPorPaso[paso]);
      if (esUltimo) {
        router.replace("/admin");
        router.refresh();
        return;
      }
      setPaso(paso + 1);
    } catch {
      setError("No se pudo guardar. Probá de nuevo.");
    }
    setGuardando(false);
  };

  return (
    <main className="flex min-h-screen justify-center bg-stone-100 p-4 text-stone-900 sm:items-center">
      <div className="flex w-full max-w-xl flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <p className="text-xs font-semibold uppercase text-stone-500">
              Paso {paso + 1} de {PASOS.length}
            </p>
            <div className="flex gap-1">
              {PASOS.map((_, indice) => (
                <span
                  key={indice}
                  className={`h-1.5 w-6 rounded-full ${indice <= paso ? "bg-stone-900" : "bg-stone-200"}`}
                />
              ))}
            </div>
          </div>
          <h1 className="text-xl font-bold">{PASOS[paso].titulo}</h1>
          <p className="text-sm text-stone-600">{PASOS[paso].descripcion}</p>
        </div>

        {paso === 0 && (
          <div className="flex flex-col gap-4">
            <SubidaLogo slug={slug} logoUrl={comercio.logoUrl} />
            <EditorTema value={tema} onChange={setTema} />
          </div>
        )}
        {paso === 1 && <EditorContenido contenido={contenido} onContenido={setContenido} />}
        {paso === 2 && (
          <div className="flex flex-col gap-5">
            <EditorHorarios value={horarios} onChange={setHorarios} />
            <EditorContacto value={contacto} onChange={setContacto} />
          </div>
        )}
        {paso === 3 && <EditorUnidades value={unidades} onChange={setUnidades} />}

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setPaso(Math.max(0, paso - 1))}
            disabled={paso === 0 || guardando}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-stone-600 disabled:opacity-40"
          >
            Atrás
          </button>
          <button
            type="button"
            onClick={() => void continuar()}
            disabled={guardando}
            className="rounded-lg bg-stone-900 px-5 py-2.5 font-semibold text-white disabled:opacity-60"
          >
            {guardando ? "Guardando..." : esUltimo ? "Terminar" : "Continuar"}
          </button>
        </div>
      </div>
    </main>
  );
}
