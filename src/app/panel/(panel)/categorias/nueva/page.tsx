import type { Metadata } from "next";

import FormularioCategoria from "@/components/panel/FormularioCategoria";
import { crearCategoria } from "@/lib/panel/acciones";

export const metadata: Metadata = {
  title: "Nueva categoría",
};

export default function NuevaCategoriaPage() {
  return (
    <section>
      <h1>Nueva categoría</h1>
      <FormularioCategoria accion={crearCategoria} />
    </section>
  );
}
