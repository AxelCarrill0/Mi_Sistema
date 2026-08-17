import { formatearPrecio } from "@/lib/catalogo/precio";
import {
  formatearFechaCotizacion,
  formatearNumeroCotizacion,
  obtenerFechaVigencia,
} from "@/lib/panel/formato";

export interface LineaCotizacionDocumento {
  id: string;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
}

export interface CotizacionDocumento {
  id: string;
  numero: number;
  nombre_cliente: string;
  telefono_cliente: string | null;
  email_cliente: string | null;
  direccion_cliente: string | null;
  vigencia_dias: number;
  observaciones: string | null;
  creado_en: string;
  total: number;
  cotizaciones_detalle: LineaCotizacionDocumento[];
}

interface Props {
  cotizacion: CotizacionDocumento;
  nombreNegocio: string;
  numeroWhatsApp: string | null;
}

export default function DocumentoCotizacion({ cotizacion, nombreNegocio, numeroWhatsApp }: Props) {
  return (
    <article className="cotizacion-documento">
      <header className="cotizacion-documento__encabezado">
        <div className="cotizacion-documento__marca">
          <p className="cotizacion-documento__negocio">{nombreNegocio}</p>
          {numeroWhatsApp ? (
            <p className="cotizacion-documento__contacto">WhatsApp: +{numeroWhatsApp}</p>
          ) : null}
        </div>
        <div className="cotizacion-documento__titulo">
          <h1>Cotización</h1>
          <p>Nº {formatearNumeroCotizacion(cotizacion.numero)}</p>
          <p>Fecha: {formatearFechaCotizacion(cotizacion.creado_en)}</p>
          <p>
            Vigencia: {cotizacion.vigencia_dias} días (hasta{" "}
            {obtenerFechaVigencia(cotizacion.creado_en, cotizacion.vigencia_dias)})
          </p>
        </div>
      </header>

      <section className="cotizacion-documento__cliente">
        <h2>Datos del cliente</h2>
        <p>{cotizacion.nombre_cliente}</p>
        {cotizacion.telefono_cliente ? <p>Teléfono: {cotizacion.telefono_cliente}</p> : null}
        {cotizacion.email_cliente ? <p>Correo: {cotizacion.email_cliente}</p> : null}
        {cotizacion.direccion_cliente ? <p>Dirección: {cotizacion.direccion_cliente}</p> : null}
      </section>

      <table className="cotizacion-documento__tabla">
        <thead>
          <tr>
            <th>Descripción</th>
            <th className="cotizacion-documento__num">Cantidad</th>
            <th className="cotizacion-documento__num">Precio unitario</th>
            <th className="cotizacion-documento__num">Total</th>
          </tr>
        </thead>
        <tbody>
          {cotizacion.cotizaciones_detalle.map((linea) => (
            <tr key={linea.id}>
              <td>{linea.descripcion}</td>
              <td className="cotizacion-documento__num">{linea.cantidad}</td>
              <td className="cotizacion-documento__num">
                {formatearPrecio(linea.precio_unitario)}
              </td>
              <td className="cotizacion-documento__num">
                {formatearPrecio(linea.precio_unitario * linea.cantidad)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="cotizacion-documento__totales">
        <p>
          Total: <strong>{formatearPrecio(cotizacion.total)}</strong>
        </p>
      </div>

      {cotizacion.observaciones ? (
        <section className="cotizacion-documento__observaciones">
          <h2>Observaciones</h2>
          <p>{cotizacion.observaciones}</p>
        </section>
      ) : null}

      <footer className="cotizacion-documento__pie">
        <p>Cotización generada por {nombreNegocio}. No constituye una factura.</p>
      </footer>
    </article>
  );
}
