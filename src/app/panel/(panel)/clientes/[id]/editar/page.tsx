import type { Metadata } from "next";
import { notFound } from "next/navigation";

import FormularioCliente from "@/components/panel/FormularioCliente";
import { actualizarCliente } from "@/lib/panel/clientes";
import { obtenerClientePanel } from "@/lib/panel/consultas";
import { createClient } from "@/lib/supabase/server";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Editar cliente",
};

export default async function EditarClientePage({ params }: Props) {
  const { id } = await params;
  const cliente = await createClient();
  const clienteDatos = await obtenerClientePanel(cliente, id);

  if (!clienteDatos) {
    notFound();
  }

  return (
    <section>
      <h1>Editar cliente</h1>
      <FormularioCliente
        accion={actualizarCliente.bind(null, id)}
        valoresIniciales={{
          nombres: clienteDatos.nombres,
          identificacion: clienteDatos.identificacion ?? "",
          telefono: clienteDatos.telefono ?? "",
          email: clienteDatos.email ?? "",
          direccion: clienteDatos.direccion ?? "",
          notas: clienteDatos.notas ?? "",
        }}
      />
    </section>
  );
}
