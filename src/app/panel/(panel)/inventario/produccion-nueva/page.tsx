import type { Metadata } from "next";

import FormularioProduccion from "@/components/panel/FormularioProduccion";
import { clienteAutorizado } from "@/lib/panel/cliente";
import { listarProductosParaMovimiento } from "@/lib/panel/consultas";

export const metadata: Metadata = {
  title: "Nueva orden de producción",
};

export default async function PaginaNuevaProduccion() {
  const cliente = await clienteAutorizado();
  const productos = await listarProductosParaMovimiento(cliente);

  return (
    <section>
      <h1>Nueva orden de producción</h1>
      <FormularioProduccion productos={productos} />
    </section>
  );
}
