import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import AccionesProduccion from "@/components/panel/AccionesProduccion";
import { clienteAutorizado } from "@/lib/panel/cliente";
import { obtenerProduccionPanel } from "@/lib/panel/consultas";
import { formatearFechaHora, formatearNumeroProduccion } from "@/lib/panel/formato";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Detalle de producción",
};

const ETIQUETAS_ESTADO: Record<string, string> = {
  activa: "Activa",
  completada: "Completada",
  cancelada: "Cancelada",
};

export default async function DetalleProduccionPage({ params }: Props) {
  const { id } = await params;
  const cliente = await clienteAutorizado();
  const produccion = await obtenerProduccionPanel(cliente, id);

  if (!produccion) {
    notFound();
  }

  return (
    <section>
      <div className="panel-titulo">
        <div>
          <h1>{formatearNumeroProduccion(produccion.numero)}</h1>
          <p className="formulario__ayuda" style={{ marginTop: "0.25rem" }}>
            Registrado el {formatearFechaHora(produccion.creado_en)} · Estado:{" "}
            <span className="panel-etiqueta">
              {ETIQUETAS_ESTADO[produccion.estado] ?? produccion.estado}
            </span>
          </p>
        </div>

        <div className="panel-lista__acciones">
          <Link href="/panel/inventario?seccion=produccion" className="boton boton--secundario">
            Volver
          </Link>
        </div>
      </div>

      <div style={{ margin: "1.5rem 0", display: "grid", gap: "0.5rem" }}>
        <h2>Detalle</h2>
        <p>
          <strong>Producto:</strong>{" "}
          {produccion.producto
            ? `${produccion.producto.nombre} (${produccion.producto.codigo_interno})`
            : "—"}
        </p>
        <p>
          <strong>Cantidad:</strong> {produccion.cantidad}
        </p>
        <p>
          <strong>Stock actual del producto:</strong>{" "}
          {produccion.producto ? produccion.producto.stock_actual : "—"}
        </p>
        {produccion.observaciones && (
          <p>
            <strong>Observaciones:</strong> {produccion.observaciones}
          </p>
        )}
      </div>

      <AccionesProduccion produccionId={produccion.id} estadoActual={produccion.estado} />

      <div style={{ marginTop: "2rem" }}>
        <h2>Historial de estados</h2>
        {produccion.historial_estados_produccion.length === 0 ? (
          <p className="mensaje-estado">Sin registros de cambios de estado.</p>
        ) : (
          <ul className="resumen-lista" style={{ marginTop: "1rem" }}>
            {produccion.historial_estados_produccion.map((item) => (
              <li
                key={item.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.75rem 1rem",
                  border: "1px solid var(--color-borde)",
                  borderRadius: "var(--radio-suave)",
                  marginBottom: "0.5rem",
                  background: "var(--color-superficie)",
                }}
              >
                <div>
                  <span className="panel-etiqueta" style={{ marginRight: "0.5rem" }}>
                    {item.estado_anterior
                      ? `${item.estado_anterior} → ${item.estado_nuevo}`
                      : `Inicial: ${item.estado_nuevo}`}
                  </span>
                  {item.motivo && <span>{item.motivo}</span>}
                  {item.perfil?.nombre_completo && (
                    <span
                      className="formulario__ayuda"
                      style={{ display: "block", marginTop: "0.25rem" }}
                    >
                      Por: {item.perfil.nombre_completo}
                    </span>
                  )}
                </div>
                <span className="formulario__ayuda">{formatearFechaHora(item.creado_en)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
