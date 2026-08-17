import type { Metadata } from "next";
import Link from "next/link";

import { cambiarEstadoColeccion } from "@/lib/panel/acciones";
import { listarColeccionesPanel } from "@/lib/panel/consultas";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Colecciones",
};

export default async function ColeccionesPanelPage() {
  const cliente = await createClient();
  const colecciones = await listarColeccionesPanel(cliente);

  return (
    <section>
      <div className="panel-titulo">
        <h1>Colecciones</h1>
        <Link href="/panel/colecciones/nueva" className="boton boton--primario">
          Nueva colección
        </Link>
      </div>

      {colecciones.length === 0 ? (
        <p className="mensaje-estado">Aún no hay colecciones.</p>
      ) : (
        <ul className="panel-lista">
          {colecciones.map((coleccion) => {
            const activa = coleccion.estado_publicacion === "activo";
            return (
              <li key={coleccion.id}>
                <span className="panel-lista__nombre">
                  {coleccion.nombre}
                  <span className={`panel-etiqueta ${activa ? "" : "panel-etiqueta--apagada"}`}>
                    {activa ? "Activa" : "Desactivada"}
                  </span>
                </span>
                <span className="panel-lista__acciones">
                  <Link
                    href={`/panel/colecciones/${coleccion.id}/editar`}
                    className="boton boton--secundario"
                  >
                    Editar
                  </Link>
                  <form action={cambiarEstadoColeccion}>
                    <input type="hidden" name="id" value={coleccion.id} />
                    <input type="hidden" name="estado" value={activa ? "desactivado" : "activo"} />
                    <button type="submit" className="boton boton--secundario">
                      {activa ? "Desactivar" : "Activar"}
                    </button>
                  </form>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
