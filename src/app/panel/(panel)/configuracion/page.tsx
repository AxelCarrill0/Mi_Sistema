import type { Metadata } from "next";

import FormularioConfiguracion from "@/components/panel/FormularioConfiguracion";
import { guardarConfiguracion } from "@/lib/panel/configuracion";
import { obtenerConfiguracionPanel } from "@/lib/panel/consultas";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Configuración",
};

export default async function ConfiguracionPanelPage() {
  const cliente = await createClient();
  const configuracion = await obtenerConfiguracionPanel(cliente);

  return (
    <section>
      <h1>Configuración</h1>
      <FormularioConfiguracion accion={guardarConfiguracion} {...configuracion} />
    </section>
  );
}
