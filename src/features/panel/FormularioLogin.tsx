"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "@/core/firebase/client";
import { esAdminDelComercio } from "./autenticacion";

export function FormularioLogin({
  slug,
  nombreComercio,
}: {
  slug: string;
  nombreComercio: string;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [verificando, comenzarVerificacion] = useTransition();
  const router = useRouter();

  // Si ya hay una sesión válida para esta tienda, directo al panel.
  useEffect(() => {
    return onAuthStateChanged(auth, async (usuario) => {
      if (usuario && (await esAdminDelComercio(slug, usuario.uid))) {
        router.replace("/admin");
      }
    });
  }, [slug, router]);

  const ingresar = (evento: React.FormEvent) => {
    evento.preventDefault();
    setError(null);
    comenzarVerificacion(async () => {
      try {
        const credencial = await signInWithEmailAndPassword(auth, email, password);
        if (await esAdminDelComercio(slug, credencial.user.uid)) {
          router.replace("/admin");
          return;
        }
        await signOut(auth);
        setError("Esta cuenta no administra esta tienda.");
      } catch {
        setError("Email o contraseña incorrectos.");
      }
    });
  };

  return (
    <form
      onSubmit={ingresar}
      className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-(--admin-borde) bg-(--admin-superficie) p-6 shadow-sm"
    >
      <div>
        <h1 className="text-xl font-bold">{nombreComercio}</h1>
        <p className="text-sm text-(--admin-texto-secundario)">Panel de administración</p>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Email
        <input
          type="email"
          required
          value={email}
          onChange={(evento) => setEmail(evento.target.value)}
          autoComplete="email"
          className="rounded-(--admin-radio-md) border border-(--admin-borde) px-3 py-2 text-base"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Contraseña
        <input
          type="password"
          required
          value={password}
          onChange={(evento) => setPassword(evento.target.value)}
          autoComplete="current-password"
          className="rounded-(--admin-radio-md) border border-(--admin-borde) px-3 py-2 text-base"
        />
      </label>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={verificando}
        className="rounded-(--admin-radio-md) bg-(--admin-acento) px-5 py-2.5 font-semibold text-(--admin-acento-texto) disabled:opacity-60"
      >
        {verificando ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}
