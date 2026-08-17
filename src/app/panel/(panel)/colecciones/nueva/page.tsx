import type { Metadata } from "next";

import FormularioColeccion from "@/components/panel/FormularioColeccion";
import { crearColeccion } from "@/lib/panel/acciones";

export const metadata: Metadata = {
  title: "Nueva colección",
};

export default function NuevaColeccionPage() {
  return (
    <section>
      <h1>Nueva colección</h1>
      <FormularioColeccion accion={crearColeccion} />
    </section>
  );
}
