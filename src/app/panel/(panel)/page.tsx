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
    {
      valor: resumen.pedidosPendientes,
      etiqueta: "Pedidos pendientes",
      href: "/panel/pedidos?estado=pendiente",
      destacado: resumen.pedidosPendientes > 0,
    },
    {
      valor: resumen.ventasRealizadas,
      etiqueta: "Ventas realizadas",
      href: "/panel/ventas",
    },
    { valor: resumen.productosActivos, etiqueta: "Productos activos", href: "/panel/productos" },
    {
      valor: resumen.productosBorrador,
      etiqueta: "Productos en borrador",
      href: "/panel/productos",
    },
    {
      valor: resumen.productosDesactivados,
      etiqueta: "Productos desactivados",
      href: "/panel/productos",
    },
    { valor: resumen.colecciones, etiqueta: "Colecciones", href: "/panel/colecciones" },
    { valor: resumen.categorias, etiqueta: "Categorías", href: "/panel/categorias" },
    {
      valor: resumen.produccionesActivas,
      etiqueta: "Producciones activas",
      href: "/panel/inventario?seccion=produccion&estado=activa",
    },
  ];

  return (
    <section>
      <h1>Resumen</h1>
      <p className="introduccion">
        Vista general del catálogo. La gestión completa se habilita en las próximas subetapas.
      </p>

      <ul className="resumen-tarjetas">
        {tarjetas.map((tarjeta) => (
          <li
            key={tarjeta.etiqueta}
            className={`resumen-tarjeta ${tarjeta.destacado ? "resumen-tarjeta--destacada" : ""}`}
          >
            <Link
              href={tarjeta.href}
              style={{ textDecoration: "none", color: "inherit", display: "block" }}
            >
              <span className="resumen-tarjeta__valor">{tarjeta.valor}</span>
              <span className="resumen-tarjeta__etiqueta">{tarjeta.etiqueta}</span>
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="inicio__subtitulo">Stock bajo</h2>
      {resumen.productosStockBajo.length > 0 ? (
        <>
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
          <p className="mensaje-estado">
            <Link href="/panel/inventario">Gestionar inventario</Link>
          </p>
        </>
      ) : (
        <p className="mensaje-estado">Sin productos con stock bajo.</p>
      )}

      <p className="mensaje-estado">
        <Link href="/catalogo">Ver catálogo público</Link>
      </p>
    </section>
  );
}
