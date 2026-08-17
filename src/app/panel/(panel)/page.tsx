import type { Metadata } from "next";
import Link from "next/link";

import { obtenerResumenPanel } from "@/lib/panel/consultas";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Resumen",
};

export default async function PanelResumenPage() {
  const cliente = await createClient();
  const resumen = await obtenerResumenPanel(cliente);

  const tarjetas = [
    { valor: resumen.productosActivos, etiqueta: "Productos activos" },
    { valor: resumen.productosBorrador, etiqueta: "Productos en borrador" },
    { valor: resumen.productosDesactivados, etiqueta: "Productos desactivados" },
    { valor: resumen.colecciones, etiqueta: "Colecciones" },
    { valor: resumen.categorias, etiqueta: "Categorías" },
  ];

  return (
    <section>
      <h1>Resumen</h1>
      <p className="introduccion">
        Vista general del catálogo. La gestión completa se habilita en las próximas subetapas.
      </p>

      <ul className="resumen-tarjetas">
        {tarjetas.map((tarjeta) => (
          <li key={tarjeta.etiqueta} className="resumen-tarjeta">
            <span className="resumen-tarjeta__valor">{tarjeta.valor}</span>
            <span className="resumen-tarjeta__etiqueta">{tarjeta.etiqueta}</span>
          </li>
        ))}
      </ul>

      <h2 className="inicio__subtitulo">Stock bajo</h2>
      {resumen.productosStockBajo.length > 0 ? (
        <ul className="resumen-lista">
          {resumen.productosStockBajo.map((producto) => (
            <li key={producto.id}>
              <span>
                {producto.codigo_interno} · {producto.nombre}
              </span>
              <span className="resumen-lista__stock">{producto.stock_actual} unidades</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mensaje-estado">Sin productos con stock bajo.</p>
      )}

      <p className="mensaje-estado">
        <Link href="/catalogo">Ver catálogo público</Link>
      </p>
    </section>
  );
}
