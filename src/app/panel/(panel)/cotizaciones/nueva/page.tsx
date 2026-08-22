import type { Metadata } from "next";

import FormularioCotizacion from "@/components/panel/FormularioCotizacion";
import { crearCotizacion } from "@/lib/panel/cotizaciones";
import { listarClientesParaSelector, listarProductosParaCotizar } from "@/lib/panel/consultas";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Nueva cotización",
};

export default async function NuevaCotizacionPage() {
  const cliente = await createClient();
  const [clientes, productos] = await Promise.all([
    listarClientesParaSelector(cliente),
    listarProductosParaCotizar(cliente),
  ]);

  return (
    <section>
      <h1>Nueva cotización</h1>
      <FormularioCotizacion
        accion={crearCotizacion}
        clientes={clientes.map((cliente) => ({
          id: cliente.id,
          nombres: cliente.nombres,
          identificacion: cliente.identificacion,
          telefono: cliente.telefono,
          email: cliente.email,
          direccion: cliente.direccion,
        }))}
        productos={productos.map((producto) => ({
          id: producto.id,
          nombre: producto.nombre,
          codigo_interno: producto.codigo_interno,
          precio_base: producto.precio_base,
        }))}
      />
    </section>
  );
}
