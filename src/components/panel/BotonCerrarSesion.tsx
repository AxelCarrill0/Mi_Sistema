"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

export default function BotonCerrarSesion() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);

  async function cerrarSesion() {
    setCargando(true);
    const cliente = createClient();
    await cliente.auth.signOut();
    router.push("/");
    router.refresh();
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
