"use client";

import { useActionState } from "react";

import type { EstadoFormulario } from "@/lib/panel/clientes";

interface Props {
  accion: (estado: EstadoFormulario, formData: FormData) => Promise<EstadoFormulario>;
  valoresIniciales?: {
    nombres?: string;
    identificacion?: string;
    telefono?: string;
    email?: string;
    direccion?: string;
    notas?: string;
  };
}

export default function FormularioCliente({ accion, valoresIniciales = {} }: Props) {
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
        <span className="formulario__etiqueta">Nombres</span>
        <input
          className="formulario__entrada"
          type="text"
          name="nombres"
          defaultValue={valoresIniciales.nombres ?? ""}
          required
        />
        {estado.errores?.nombres ? (
          <span className="formulario__error">{estado.errores.nombres}</span>
        ) : null}
      </label>

      <div className="formulario__fila">
        <label className="formulario__campo">
          <span className="formulario__etiqueta">Identificación (cédula o RUC)</span>
          <input
            className="formulario__entrada"
            type="text"
            name="identificacion"
            defaultValue={valoresIniciales.identificacion ?? ""}
          />
          {estado.errores?.identificacion ? (
            <span className="formulario__error">{estado.errores.identificacion}</span>
          ) : null}
        </label>

        <label className="formulario__campo">
          <span className="formulario__etiqueta">Teléfono</span>
          <input
            className="formulario__entrada"
            type="text"
            name="telefono"
            defaultValue={valoresIniciales.telefono ?? ""}
          />
        </label>

        <label className="formulario__campo">
          <span className="formulario__etiqueta">Correo</span>
          <input
            className="formulario__entrada"
            type="email"
            name="email"
            defaultValue={valoresIniciales.email ?? ""}
          />
          {estado.errores?.email ? (
            <span className="formulario__error">{estado.errores.email}</span>
          ) : null}
        </label>
      </div>

      <label className="formulario__campo">
        <span className="formulario__etiqueta">Dirección</span>
        <input
          className="formulario__entrada"
          type="text"
          name="direccion"
          defaultValue={valoresIniciales.direccion ?? ""}
        />
      </label>

      <label className="formulario__campo">
        <span className="formulario__etiqueta">Notas</span>
        <textarea
          className="formulario__entrada"
          name="notas"
          rows={3}
          defaultValue={valoresIniciales.notas ?? ""}
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
