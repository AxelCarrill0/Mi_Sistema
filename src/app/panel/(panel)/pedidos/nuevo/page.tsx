import type { Metadata } from "next";

import FormularioPedido, { type CotizacionOrigen } from "@/components/panel/FormularioPedido";
import { clienteAutorizado } from "@/lib/panel/cliente";
import {
  listarClientesPanel,
  listarProductosParaCotizar,
  obtenerCotizacionPanel,
} from "@/lib/panel/consultas";

export const metadata: Metadata = {
  title: "Nuevo pedido",
};

interface Props {
  searchParams: Promise<{ cotizacion_id?: string }>;
}

export default async function PaginaNuevoPedido({ searchParams }: Props) {
  const { cotizacion_id: cotizacionId } = await searchParams;
  const cliente = await clienteAutorizado();

  const [clientes, productos, cotizacionRaw] = await Promise.all([
    listarClientesPanel(cliente),
    listarProductosParaCotizar(cliente),
    cotizacionId ? obtenerCotizacionPanel(cliente, cotizacionId) : null,
  ]);

  let cotizacionOrigen: CotizacionOrigen | null = null;
  if (cotizacionRaw) {
    cotizacionOrigen = {
      id: cotizacionRaw.id,
      numero: cotizacionRaw.numero,
      cliente_id: cotizacionRaw.cliente_id,
      nombre_cliente: cotizacionRaw.nombre_cliente,
      telefono_cliente: cotizacionRaw.telefono_cliente,
      email_cliente: cotizacionRaw.email_cliente,
      direccion_cliente: cotizacionRaw.direccion_cliente,
      observaciones: cotizacionRaw.observaciones,
      detalles: (cotizacionRaw.cotizaciones_detalle ?? []).map((d) => ({
        producto_id: d.producto_id,
        descripcion: d.descripcion,
        cantidad: d.cantidad,
        precio_unitario: d.precio_unitario,
      })),
    };
  }

  return (
    <section>
      <h1>Nuevo pedido</h1>
      <FormularioPedido
        clientes={clientes}
        productos={productos}
        cotizacionOrigen={cotizacionOrigen}
      />
    </section>
  );
}
