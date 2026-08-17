import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import BotonImprimir from "@/components/panel/BotonImprimir";
import DocumentoCotizacion from "@/components/panel/DocumentoCotizacion";
import { obtenerConfiguracionWhatsApp, obtenerNombreNegocio } from "@/lib/catalogo/configuracion";
import { cambiarEstadoCotizacion } from "@/lib/panel/cotizaciones";
import { obtenerCotizacionPanel } from "@/lib/panel/consultas";
import { formatearNumeroCotizacion } from "@/lib/panel/formato";
import { createClient } from "@/lib/supabase/server";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Cotización",
};

const ETIQUETAS_ESTADO: Record<string, string> = {
  borrador: "Borrador",
  enviada: "Enviada",
  aceptada: "Aceptada",
  rechazada: "Rechazada",
};

export default async function DetalleCotizacionPage({ params }: Props) {
  const { id } = await params;
  const cliente = await createClient();
  const [cotizacion, nombreNegocio, whatsapp] = await Promise.all([
    obtenerCotizacionPanel(cliente, id),
    obtenerNombreNegocio(),
    obtenerConfiguracionWhatsApp(),
  ]);

  if (!cotizacion) {
    notFound();
  }

  return (
    <section>
      <div className="panel-titulo">
        <h1>{formatearNumeroCotizacion(cotizacion.numero)}</h1>
        <div className="panel-lista__acciones">
          <Link href="/panel/cotizaciones" className="boton boton--secundario">
            Volver
          </Link>
          <BotonImprimir />
          <form action={cambiarEstadoCotizacion}>
            <input type="hidden" name="id" value={cotizacion.id} />
            <select className="formulario__entrada" name="estado" defaultValue={cotizacion.estado}>
              {Object.entries(ETIQUETAS_ESTADO).map(([valor, etiqueta]) => (
                <option key={valor} value={valor}>
                  {etiqueta}
                </option>
              ))}
            </select>
            <button type="submit" className="boton boton--secundario">
              Cambiar estado
            </button>
          </form>
        </div>
      </div>

      <DocumentoCotizacion
        cotizacion={cotizacion}
        nombreNegocio={nombreNegocio}
        numeroWhatsApp={whatsapp.numero}
      />
    </section>
  );
}
