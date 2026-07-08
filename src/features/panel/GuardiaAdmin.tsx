"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/core/firebase/client";
import { esAdminDelComercio } from "./autenticacion";

type EstadoGuardia = "cargando" | "anonimo" | "ajeno" | "autorizado";

/** Solo deja pasar a usuarios autenticados que sean admins de ESTE slug:
 * un admin de otro comercio con cuenta válida queda afuera igual. */
export function GuardiaAdmin({ slug, children }: { slug: string; children: React.ReactNode }) {
  const [estado, setEstado] = useState<EstadoGuardia>("cargando");
  const router = useRouter();

  useEffect(() => {
    return onAuthStateChanged(auth, async (usuario) => {
      if (!usuario) {
        setEstado("anonimo");
        return;
      }
      setEstado((await esAdminDelComercio(slug, usuario.uid)) ? "autorizado" : "ajeno");
    });
  }, [slug]);

  useEffect(() => {
    if (estado === "anonimo") router.replace("/admin/login");
  }, [estado, router]);

  if (estado === "autorizado") return <>{children}</>;

  if (estado === "ajeno") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-stone-100 p-8 text-center text-stone-900">
        <h1 className="text-xl font-bold">Esta cuenta no administra esta tienda</h1>
        <p className="max-w-md text-stone-600">
          Tu usuario existe pero no tiene permisos sobre este comercio. Cerrá sesión e ingresá
          con la cuenta correcta.
        </p>
        <button
          type="button"
          onClick={() => signOut(auth)}
          className="rounded-lg bg-stone-900 px-5 py-2.5 font-semibold text-white"
        >
          Cerrar sesión
        </button>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-100 text-stone-900">
      <p className="animate-pulse text-stone-500">Verificando acceso...</p>
    </main>
  );
}
