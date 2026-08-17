import type { Metadata } from "next";
import Link from "next/link";

import { listarClientesPanel } from "@/lib/panel/consultas";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Clientes",
};

export default async function ClientesPanelPage() {
  const cliente = await createClient();
  const clientes = await listarClientesPanel(cliente);

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
      )}
    </section>
  );
}
