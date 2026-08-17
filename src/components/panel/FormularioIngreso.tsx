"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";

import { createClient } from "@/lib/supabase/client";

function FormularioIngresoContenido() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function ingresar(evento: FormEvent) {
    evento.preventDefault();
    setCargando(true);
    setError(null);

    const cliente = createClient();
    const { error: errorAutenticacion } = await cliente.auth.signInWithPassword({
      email,
      password,
    });

    if (errorAutenticacion) {
      setError("Credenciales incorrectas o sin acceso autorizado.");
      setCargando(false);
      return;
    }

    const siguiente = searchParams.get("siguiente");
    router.push(siguiente && siguiente.startsWith("/panel") ? siguiente : "/panel");
    router.refresh();
  }

  return (
    <form className="ingreso__formulario" onSubmit={ingresar}>
      {error ? (
        <p role="alert" className="ingreso__error">
          {error}
        </p>
      ) : null}

      <label className="filtros__campo">
        <span className="filtros__etiqueta">Correo electrónico</span>
        <input
          className="filtros__entrada"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(evento) => setEmail(evento.target.value)}
        />
      </label>

      <label className="filtros__campo">
        <span className="filtros__etiqueta">Contraseña</span>
        <input
          className="filtros__entrada"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(evento) => setPassword(evento.target.value)}
        />
      </label>

      <button type="submit" className="boton boton--primario" disabled={cargando}>
        {cargando ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}

export default function FormularioIngreso() {
  return (
    <Suspense fallback={null}>
      <FormularioIngresoContenido />
    </Suspense>
  );
}
