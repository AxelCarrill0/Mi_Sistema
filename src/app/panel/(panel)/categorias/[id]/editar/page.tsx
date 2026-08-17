import type { Metadata } from "next";
import { notFound } from "next/navigation";

import FormularioCategoria from "@/components/panel/FormularioCategoria";
import { actualizarCategoria } from "@/lib/panel/acciones";
import { obtenerCategoriaPanel } from "@/lib/panel/consultas";
import { createClient } from "@/lib/supabase/server";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Editar categoría",
};

export default async function EditarCategoriaPage({ params }: Props) {
  const { id } = await params;
  const cliente = await createClient();
  const categoria = await obtenerCategoriaPanel(cliente, id);

  if (!categoria) {
    notFound();
  }

  return (
    <section>
      <h1>Editar categoría</h1>
      <FormularioCategoria
        accion={actualizarCategoria.bind(null, id)}
        valoresIniciales={{
          nombre: categoria.nombre,
          descripcion: categoria.descripcion ?? "",
        }}
      />
    </section>
  );
}
