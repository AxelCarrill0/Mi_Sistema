import type { Metadata } from "next";

import FormularioVenta from "@/components/panel/FormularioVenta";
import { clienteAutorizado } from "@/lib/panel/cliente";
import { listarClientesParaSelector, listarProductosParaCotizar } from "@/lib/panel/consultas";

export const metadata: Metadata = {
  title: "Nueva venta",
};

export default async function PaginaNuevaVenta() {
  const cliente = await clienteAutorizado();

  const [clientes, productos] = await Promise.all([
    listarClientesParaSelector(cliente),
    listarProductosParaCotizar(cliente),
  ]);

  return (
    <section>
      <h1>Nueva venta</h1>
      <FormularioVenta clientes={clientes} productos={productos} />
    </section>
  );
}
