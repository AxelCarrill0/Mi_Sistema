import {
  formatearFechaHora,
  formatearMonedaUSD,
  formatearNumeroPedido,
  formatearNumeroVenta,
} from "@/lib/panel/formato";
import type { PagoPanel } from "@/lib/panel/tipos";

export interface LineaVentaDocumento {
  id: string;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
}

export interface VentaDocumento {
  id: string;
  numero: number;
  nombre_cliente: string;
  telefono_cliente: string | null;
  email_cliente: string | null;
  direccion_cliente: string | null;
  observaciones: string | null;
  creado_en: string;
  total: number;
  abonos: number;
  saldo: number;
  detalles_venta: LineaVentaDocumento[];
  pagos: PagoPanel[];
  pedido?: { id: string; numero: number } | null;
}

interface Props {
  venta: VentaDocumento;
  nombreNegocio: string;
  numeroWhatsApp: string | null;
}

export default function DocumentoVenta({ venta, nombreNegocio, numeroWhatsApp }: Props) {
  // En Ecuador: cálculo fiscal estándar (subtotal, IVA y total)
  // Subtotal base = total / 1.15 si incluye IVA, o total como base
  const total = venta.total;

  return (
    <article className="cotizacion-documento">
      <header className="cotizacion-documento__encabezado">
        <div className="cotizacion-documento__marca">
          <p className="cotizacion-documento__negocio">{nombreNegocio}</p>
          <p className="cotizacion-documento__contacto">Artículos de Madera y Decoración</p>
          <p className="cotizacion-documento__contacto">Ecuador</p>
          {numeroWhatsApp ? (
            <p className="cotizacion-documento__contacto">WhatsApp: +{numeroWhatsApp}</p>
          ) : null}
        </div>
        <div className="cotizacion-documento__titulo">
          <h1>Comprobante interno de venta</h1>
          <p className="texto-destacado">Nº {formatearNumeroVenta(venta.numero)}</p>
          <p>Fecha y hora: {formatearFechaHora(venta.creado_en)}</p>
          {venta.pedido && <p>Origen: Pedido {formatearNumeroPedido(venta.pedido.numero)}</p>}
        </div>
      </header>

      <section className="cotizacion-documento__cliente">
        <h2>Datos del Cliente / Adquirente</h2>
        <div className="cotizacion-documento__cliente-grid">
          <div>
            <strong>Razón Social / Nombre:</strong> {venta.nombre_cliente}
          </div>
          <div>
            <strong>Identificación (C.I. / RUC):</strong> No registrada
          </div>
          {venta.telefono_cliente && (
            <div>
              <strong>Teléfono:</strong> {venta.telefono_cliente}
            </div>
          )}
          {venta.email_cliente && (
            <div>
              <strong>Correo:</strong> {venta.email_cliente}
            </div>
          )}
          {venta.direccion_cliente && (
            <div>
              <strong>Dirección:</strong> {venta.direccion_cliente}
            </div>
          )}
        </div>
      </section>

      <table className="cotizacion-documento__tabla">
        <thead>
          <tr>
            <th>Cant.</th>
            <th>Descripción / Producto</th>
            <th className="cotizacion-documento__num">Precio Unitario</th>
            <th className="cotizacion-documento__num">Total</th>
          </tr>
        </thead>
        <tbody>
          {venta.detalles_venta.map((linea) => (
            <tr key={linea.id}>
              <td className="cotizacion-documento__num">{linea.cantidad}</td>
              <td>{linea.descripcion}</td>
              <td className="cotizacion-documento__num">
                {formatearMonedaUSD(linea.precio_unitario)}
              </td>
              <td className="cotizacion-documento__num">
                {formatearMonedaUSD(linea.precio_unitario * linea.cantidad)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="cotizacion-documento__totales">
        <div className="desglose-totales">
          <p>
            Subtotal: <strong>{formatearMonedaUSD(total)}</strong>
          </p>
          <p>
            Total Venta (USD): <strong className="texto-grande">{formatearMonedaUSD(total)}</strong>
          </p>
        </div>
      </div>

      {venta.observaciones && (
        <section className="cotizacion-documento__observaciones">
          <h2>Observaciones</h2>
          <p>{venta.observaciones}</p>
        </section>
      )}

      <footer className="cotizacion-documento__pie">
        <p>
          Documento interno de entrega y control comercial. No reemplaza una factura electrónica
          autorizada por el SRI.
        </p>
      </footer>
    </article>
  );
}
