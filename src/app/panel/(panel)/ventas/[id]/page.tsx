import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import BotonImprimir from "@/components/panel/BotonImprimir";
import DocumentoVenta, { type VentaDocumento } from "@/components/panel/DocumentoVenta";
import SeccionAbonos from "@/components/panel/SeccionAbonos";
import { clienteAutorizado } from "@/lib/panel/cliente";
import { obtenerConfiguracionPanel, obtenerVentaPanel } from "@/lib/panel/consultas";
import { formatearNumeroPedido, formatearNumeroVenta } from "@/lib/panel/formato";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Detalle de venta",
};

export default async function DetalleVentaPage({ params }: Props) {
  const { id } = await params;
  const cliente = await clienteAutorizado();

  const [venta, configuracion] = await Promise.all([
    obtenerVentaPanel(cliente, id),
    obtenerConfiguracionPanel(cliente),
  ]);

  if (!venta) {
    notFound();
  }

  const ventaDoc: VentaDocumento = {
    id: venta.id,
    numero: venta.numero,
    nombre_cliente: venta.nombre_cliente,
    telefono_cliente: venta.telefono_cliente,
    email_cliente: venta.email_cliente,
    direccion_cliente: venta.direccion_cliente,
    observaciones: venta.observaciones,
    creado_en: venta.creado_en,
    total: venta.total,
    abonos: venta.abonos,
    saldo: venta.saldo,
    detalles_venta: venta.detalles_venta.map((d) => ({
      id: d.id,
      descripcion: d.descripcion,
      cantidad: d.cantidad,
      precio_unitario: d.precio_unitario,
    })),
    pagos: venta.pagos,
    pedido: venta.pedido,
  };

  return (
    <section>
      <div className="panel-titulo">
        <h1>{formatearNumeroVenta(venta.numero)}</h1>
        <div className="panel-lista__acciones">
          <Link href="/panel/ventas" className="boton boton--secundario">
            Volver
          </Link>
          {venta.pedido && (
            <Link href={`/panel/pedidos/${venta.pedido.id}`} className="boton boton--secundario">
              Ver pedido ({formatearNumeroPedido(venta.pedido.numero)})
            </Link>
          )}
          <BotonImprimir nombreArchivo={`Venta-${formatearNumeroVenta(venta.numero)}`} />
        </div>
      </div>

      <DocumentoVenta
        venta={ventaDoc}
        nombreNegocio={configuracion.nombreNegocio}
        numeroWhatsApp={configuracion.numeroWhatsApp}
      />

      <SeccionAbonos
        ventaId={venta.id}
        total={venta.total}
        abonos={venta.pagos}
        saldo={venta.saldo}
      />
    </section>
  );
}
