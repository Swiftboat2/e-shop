"use client";

import { useState } from "react";
import { EditorContacto } from "./editores/EditorContacto";
import { EditorContenido } from "./editores/EditorContenido";
import { EditorDescuentos } from "./editores/EditorDescuentos";
import { EditorHorarios } from "./editores/EditorHorarios";
import { EditorMetodosPago } from "./editores/EditorMetodosPago";
import { EditorTema } from "./editores/EditorTema";
import { EditorUnidades } from "./editores/EditorUnidades";
import { SubidaLogo } from "./editores/SubidaLogo";
import { actualizarComercio } from "./mutaciones";
import type { Comercio } from "@/core/types";

function useGuardar(slug: string) {
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const guardar = async (datos: Record<string, unknown>) => {
    setGuardando(true);
    setGuardado(false);
    setError(null);
    try {
      await actualizarComercio(slug, datos);
      setGuardado(true);
    } catch {
      setError("No se pudo guardar.");
    }
    setGuardando(false);
  };

  return { guardar, guardando, guardado, error };
}

function Tarjeta({
  titulo,
  children,
  onGuardar,
  estado,
}: {
  titulo: string;
  children: React.ReactNode;
  onGuardar: () => void;
  estado: ReturnType<typeof useGuardar>;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-stone-200 bg-white p-5">
      <h2 className="text-lg font-bold">{titulo}</h2>
      {children}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onGuardar}
          disabled={estado.guardando}
          className="w-fit rounded-lg bg-stone-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {estado.guardando ? "Guardando..." : "Guardar"}
        </button>
        {estado.guardado && <span className="text-sm font-medium text-emerald-700">Guardado</span>}
        {estado.error && <span className="text-sm font-medium text-red-600">{estado.error}</span>}
      </div>
    </section>
  );
}

export function Configuracion({ slug, comercio }: { slug: string; comercio: Comercio }) {
  const [tema, setTema] = useState(comercio.tema);
  const [contenido, setContenido] = useState(comercio.contenido);
  const [features, setFeatures] = useState(comercio.features);
  const [horarios, setHorarios] = useState(comercio.horarios);
  const [contacto, setContacto] = useState(comercio.contacto);
  const [metodos, setMetodos] = useState(comercio.configuracion.metodosPago);
  const [unidades, setUnidades] = useState(comercio.configuracion.unidadesDeVentaDisponibles);
  const [descuentos, setDescuentos] = useState(comercio.configuracion.descuentosPorVolumen);

  const estadoTema = useGuardar(slug);
  const estadoContenido = useGuardar(slug);
  const estadoHorarios = useGuardar(slug);
  const estadoContacto = useGuardar(slug);
  const estadoMetodos = useGuardar(slug);
  const estadoUnidades = useGuardar(slug);
  const estadoDescuentos = useGuardar(slug);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Configuración</h1>

      <Tarjeta
        titulo="Tema y marca"
        estado={estadoTema}
        onGuardar={() => void estadoTema.guardar({ tema })}
      >
        <SubidaLogo slug={slug} logoUrl={comercio.logoUrl} />
        <EditorTema value={tema} onChange={setTema} />
      </Tarjeta>

      <Tarjeta
        titulo="Contenido de la portada"
        estado={estadoContenido}
        onGuardar={() =>
          void estadoContenido.guardar({
            contenido,
            features: features.filter((feature) => feature.texto.trim()),
          })
        }
      >
        <EditorContenido
          contenido={contenido}
          onContenido={setContenido}
          features={features}
          onFeatures={setFeatures}
        />
      </Tarjeta>

      <Tarjeta
        titulo="Horarios"
        estado={estadoHorarios}
        onGuardar={() => void estadoHorarios.guardar({ horarios })}
      >
        <EditorHorarios value={horarios} onChange={setHorarios} />
      </Tarjeta>

      <Tarjeta
        titulo="Contacto y ubicación"
        estado={estadoContacto}
        onGuardar={() => void estadoContacto.guardar({ contacto })}
      >
        <EditorContacto value={contacto} onChange={setContacto} />
      </Tarjeta>

      <Tarjeta
        titulo="Métodos de pago"
        estado={estadoMetodos}
        onGuardar={() => void estadoMetodos.guardar({ "configuracion.metodosPago": metodos })}
      >
        <EditorMetodosPago value={metodos} onChange={setMetodos} />
      </Tarjeta>

      <Tarjeta
        titulo="Unidades de venta"
        estado={estadoUnidades}
        onGuardar={() =>
          void estadoUnidades.guardar({ "configuracion.unidadesDeVentaDisponibles": unidades })
        }
      >
        <EditorUnidades value={unidades} onChange={setUnidades} />
      </Tarjeta>

      <Tarjeta
        titulo="Descuentos por volumen"
        estado={estadoDescuentos}
        onGuardar={() =>
          void estadoDescuentos.guardar({ "configuracion.descuentosPorVolumen": descuentos })
        }
      >
        <EditorDescuentos value={descuentos} metodosPago={metodos} onChange={setDescuentos} />
      </Tarjeta>
    </div>
  );
}
