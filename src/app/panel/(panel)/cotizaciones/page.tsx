import type { Metadata } from "next";
import Link from "next/link";

import { formatearPrecio } from "@/lib/catalogo/precio";
import { listarCotizacionesPanel } from "@/lib/panel/consultas";
import { formatearFechaCotizacion, formatearNumeroCotizacion } from "@/lib/panel/formato";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Cotizaciones",
};

const ETIQUETAS_ESTADO: Record<string, string> = {
  borrador: "Borrador",
  enviada: "Enviada",
  aceptada: "Aceptada",
  rechazada: "Rechazada",
};

export default async function CotizacionesPanelPage() {
  const cliente = await createClient();
  const cotizaciones = await listarCotizacionesPanel(cliente);

  return (
    <section>
      <div className="panel-titulo">
        <h1>Cotizaciones</h1>
        <Link href="/panel/cotizaciones/nueva" className="boton boton--primario">
          Nueva cotización
        </Link>
      </div>

      {cotizaciones.length === 0 ? (
        <p className="mensaje-estado">Aún no hay cotizaciones.</p>
      ) : (
        <div className="panel-tabla panel-tabla--cotizaciones">
          <div className="panel-tabla__encabezado">
            <span>Nº</span>
            <span>Cliente</span>
            <span>Estado</span>
            <span>Fecha</span>
            <span>Total</span>
            <span>Acciones</span>
          </div>
          {cotizaciones.map((cotizacion) => (
            <div className="panel-tabla__fila" key={cotizacion.id}>
              <span>{formatearNumeroCotizacion(cotizacion.numero)}</span>
              <span>{cotizacion.nombre_cliente}</span>
              <span>
                <span className="panel-etiqueta">
                  {ETIQUETAS_ESTADO[cotizacion.estado] ?? cotizacion.estado}
                </span>
              </span>
              <span>{formatearFechaCotizacion(cotizacion.creado_en)}</span>
              <span>{formatearPrecio(cotizacion.total)}</span>
              <span className="panel-lista__acciones">
                <Link
                  href={`/panel/cotizaciones/${cotizacion.id}`}
                  className="boton boton--secundario"
                >
                  Ver
                </Link>
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
