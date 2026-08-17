"use client";

import { useActionState } from "react";

import type { EstadoFormulario } from "@/lib/panel/acciones";

interface Props {
  accion: (estado: EstadoFormulario, formData: FormData) => Promise<EstadoFormulario>;
  valoresIniciales?: { nombre?: string; descripcion?: string };
}

export default function FormularioColeccion({ accion, valoresIniciales = {} }: Props) {
  const [estado, formAction, pendiente] = useActionState(accion, {
    valores: valoresIniciales,
  });

  return (
    <form action={formAction} className="formulario">
      {estado.errores?.formulario ? (
        <p role="alert" className="formulario__error">
          {estado.errores.formulario}
        </p>
      ) : null}

      <label className="formulario__campo">
        <span className="formulario__etiqueta">Nombre</span>
        <input
          className="formulario__entrada"
          type="text"
          name="nombre"
          defaultValue={valoresIniciales.nombre ?? ""}
          required
        />
        {estado.errores?.nombre ? (
          <span className="formulario__error">{estado.errores.nombre}</span>
        ) : null}
      </label>

      <label className="formulario__campo">
        <span className="formulario__etiqueta">Descripción</span>
        <textarea
          className="formulario__entrada"
          name="descripcion"
          rows={4}
          defaultValue={valoresIniciales.descripcion ?? ""}
        />
      </label>

      <div className="formulario__acciones">
        <button type="submit" className="boton boton--primario" disabled={pendiente}>
          {pendiente ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </form>
  );
}
