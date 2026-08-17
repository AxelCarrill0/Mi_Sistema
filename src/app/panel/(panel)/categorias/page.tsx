import type { Metadata } from "next";
import Link from "next/link";

import { cambiarEstadoCategoria } from "@/lib/panel/acciones";
import { listarCategoriasPanel } from "@/lib/panel/consultas";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Categorías",
};

export default async function CategoriasPanelPage() {
  const cliente = await createClient();
  const categorias = await listarCategoriasPanel(cliente);

  return (
    <section>
      <div className="panel-titulo">
        <h1>Categorías</h1>
        <Link href="/panel/categorias/nueva" className="boton boton--primario">
          Nueva categoría
        </Link>
      </div>

      {categorias.length === 0 ? (
        <p className="mensaje-estado">Aún no hay categorías.</p>
      ) : (
        <ul className="panel-lista">
          {categorias.map((categoria) => (
            <li key={categoria.id}>
              <span className="panel-lista__nombre">
                {categoria.nombre}
                <span
                  className={`panel-etiqueta ${categoria.activo ? "" : "panel-etiqueta--apagada"}`}
                >
                  {categoria.activo ? "Activa" : "Inactiva"}
                </span>
              </span>
              <span className="panel-lista__acciones">
                <Link
                  href={`/panel/categorias/${categoria.id}/editar`}
                  className="boton boton--secundario"
                >
                  Editar
                </Link>
                <form action={cambiarEstadoCategoria}>
                  <input type="hidden" name="id" value={categoria.id} />
                  <input type="hidden" name="activo" value={categoria.activo ? "false" : "true"} />
                  <button type="submit" className="boton boton--secundario">
                    {categoria.activo ? "Desactivar" : "Activar"}
                  </button>
                </form>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
