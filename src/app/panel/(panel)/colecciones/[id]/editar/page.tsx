import type { Metadata } from "next";
import { notFound } from "next/navigation";

import FormularioColeccion from "@/components/panel/FormularioColeccion";
import { actualizarColeccion } from "@/lib/panel/acciones";
import { obtenerColeccionPanel } from "@/lib/panel/consultas";
import { createClient } from "@/lib/supabase/server";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Editar colección",
};

export default async function EditarColeccionPage({ params }: Props) {
  const { id } = await params;
  const cliente = await createClient();
  const coleccion = await obtenerColeccionPanel(cliente, id);

  if (!coleccion) {
    notFound();
  }

  return (
    <section>
      <h1>Editar colección</h1>
      <FormularioColeccion
        accion={actualizarColeccion.bind(null, id)}
        valoresIniciales={{
          nombre: coleccion.nombre,
          descripcion: coleccion.descripcion ?? "",
        }}
      />
    </section>
  );
}
