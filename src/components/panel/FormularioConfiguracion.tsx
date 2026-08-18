"use client";

import { useActionState } from "react";

import type { EstadoFormulario } from "@/lib/panel/configuracion";

interface Props {
  accion: (estado: EstadoFormulario, formData: FormData) => Promise<EstadoFormulario>;
  nombreNegocio: string;
  mostrarPreciosPublicos: boolean;
  numeroWhatsApp: string;
  mensajePredeterminado: string;
  umbralStockBajo: number;
}

export default function FormularioConfiguracion({
  accion,
  nombreNegocio,
  mostrarPreciosPublicos,
  numeroWhatsApp,
  mensajePredeterminado,
  umbralStockBajo,
}: Props) {
  const [estado, formAction, pendiente] = useActionState(accion, {});

  return (
    <form action={formAction} className="formulario">
      {estado.errores?.formulario ? (
        <p role="alert" className="formulario__error">
          {estado.errores.formulario}
        </p>
      ) : null}

      <h2>Negocio</h2>

      <label className="formulario__campo">
        <span className="formulario__etiqueta">Nombre del negocio</span>
        <input
          className="formulario__entrada"
          type="text"
          name="nombre_negocio"
          defaultValue={nombreNegocio}
          required
        />
        {estado.errores?.nombre_negocio ? (
          <span className="formulario__error">{estado.errores.nombre_negocio}</span>
        ) : null}
      </label>

      <div className="formulario__opciones">
        <label className="formulario__opcion">
          <input
            type="checkbox"
            name="mostrar_precios_publicos"
            defaultChecked={mostrarPreciosPublicos}
          />
          Mostrar precios públicos en el catálogo
        </label>
      </div>

      <label className="formulario__campo">
        <span className="formulario__etiqueta">Umbral de stock bajo (unidades)</span>
        <input
          className="formulario__entrada"
          type="number"
          name="umbral_stock_bajo"
          min="0"
          step="1"
          defaultValue={umbralStockBajo}
        />
        <span className="formulario__ayuda">
          Los productos con stock igual o menor a este valor se marcarán como stock bajo.
        </span>
        {estado.errores?.umbral_stock_bajo ? (
          <span className="formulario__error">{estado.errores.umbral_stock_bajo}</span>
        ) : null}
      </label>

      <h2>WhatsApp</h2>

      <label className="formulario__campo">
        <span className="formulario__etiqueta">Número de WhatsApp (solo dígitos)</span>
        <input
          className="formulario__entrada"
          type="text"
          name="numero_whatsapp"
          defaultValue={numeroWhatsApp}
          placeholder="593999999999"
        />
        {estado.errores?.numero_whatsapp ? (
          <span className="formulario__error">{estado.errores.numero_whatsapp}</span>
        ) : null}
      </label>

      <label className="formulario__campo">
        <span className="formulario__etiqueta">Mensaje predeterminado de WhatsApp</span>
        <textarea
          className="formulario__entrada"
          name="mensaje_predeterminado"
          rows={4}
          defaultValue={mensajePredeterminado}
        />
        {estado.errores?.mensaje_predeterminado ? (
          <span className="formulario__error">{estado.errores.mensaje_predeterminado}</span>
        ) : null}
      </label>

      <div className="formulario__acciones">
        <button type="submit" className="boton boton--primario" disabled={pendiente}>
          {pendiente ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </form>
  );
}
