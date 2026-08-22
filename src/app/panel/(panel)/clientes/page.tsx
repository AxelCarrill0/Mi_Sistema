import type { Metadata } from "next";
import Link from "next/link";

import Paginacion from "@/components/Paginacion";
import { listarClientesPanel } from "@/lib/panel/consultas";
import { obtenerNumeroPagina, TAMANO_PAGINA_PANEL } from "@/lib/paginacion";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Clientes",
};

interface Props {
  searchParams: Promise<{ pagina?: string | string[] }>;
}

export default async function ClientesPanelPage({ searchParams }: Props) {
  const { pagina: paginaParametro } = await searchParams;
  const pagina = obtenerNumeroPagina(paginaParametro);
  const cliente = await createClient();
  const { filas: clientes, total } = await listarClientesPanel(cliente, { pagina });

  return (
    <section>
      <div className="panel-titulo">
        <h1>Clientes</h1>
        <Link href="/panel/clientes/nuevo" className="boton boton--primario">
          Nuevo cliente
        </Link>
      </div>

      {clientes.length === 0 ? (
        <p className="mensaje-estado">Aún no hay clientes.</p>
      ) : (
        <>
          <div className="panel-tabla">
            <div className="panel-tabla__encabezado">
              <span>Nombre</span>
              <span>Identificación</span>
              <span>Teléfono</span>
              <span>Correo</span>
              <span>Acciones</span>
            </div>
            {clientes.map((cliente) => (
              <div className="panel-tabla__fila" key={cliente.id}>
                <span>{cliente.nombres}</span>
                <span>{cliente.identificacion ?? "—"}</span>
                <span>{cliente.telefono ?? "—"}</span>
                <span>{cliente.email ?? "—"}</span>
                <span className="panel-lista__acciones">
                  <Link
                    href={`/panel/clientes/${cliente.id}/editar`}
                    className="boton boton--secundario"
                  >
                    Editar
                  </Link>
                </span>
              </div>
            ))}
          </div>
          <Paginacion
            pagina={pagina}
            total={total}
            porPagina={TAMANO_PAGINA_PANEL}
            construirHref={(siguiente) => `/panel/clientes?pagina=${siguiente}`}
          />
        </>
      )}
    </section>
  );
}
