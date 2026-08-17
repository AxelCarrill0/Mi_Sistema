import type { Metadata } from "next";

import FormularioProducto from "@/components/panel/FormularioProducto";
import { crearProducto } from "@/lib/panel/acciones";
import { listarCategoriasPanel, listarColeccionesPanel } from "@/lib/panel/consultas";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Nuevo producto",
};

export default async function NuevoProductoPage() {
  const cliente = await createClient();
  const [colecciones, categorias] = await Promise.all([
    listarColeccionesPanel(cliente, { soloActivas: true }),
    listarCategoriasPanel(cliente, { soloActivas: true }),
  ]);

  return (
    <section>
      <h1>Nuevo producto</h1>
      <FormularioProducto
        accion={crearProducto}
        colecciones={colecciones.map((coleccion) => ({
          id: coleccion.id,
          nombre: coleccion.nombre,
          activa: coleccion.estado_publicacion === "activo",
        }))}
        categorias={categorias.map((categoria) => ({
          id: categoria.id,
          nombre: categoria.nombre,
          activa: categoria.activo,
        }))}
      />
    </section>
  );
}
