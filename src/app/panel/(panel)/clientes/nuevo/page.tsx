import type { Metadata } from "next";

import FormularioCliente from "@/components/panel/FormularioCliente";
import { crearCliente } from "@/lib/panel/clientes";

export const metadata: Metadata = {
  title: "Nuevo cliente",
};

export default function NuevoClientePage() {
  return (
    <section>
      <h1>Nuevo cliente</h1>
      <FormularioCliente accion={crearCliente} />
    </section>
  );
}
