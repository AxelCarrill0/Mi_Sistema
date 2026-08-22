"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

export default function BotonCerrarSesion() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);

  async function cerrarSesion() {
    setCargando(true);
    try {
      const cliente = createClient();
      const { error } = await cliente.auth.signOut();
      if (error) {
        throw error;
      }
      router.push("/");
      router.refresh();
    } catch {
      setCargando(false);
    }
  }

  return (
    <button
      type="button"
      className="boton boton--secundario"
      onClick={cerrarSesion}
      disabled={cargando}
    >
      {cargando ? "Cerrando…" : "Cerrar sesión"}
    </button>
  );
}
