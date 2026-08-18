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
      acento: "naranja",
      destacado: resumen.pedidosPendientes > 0,
    },
    {
      valor: resumen.ventasRealizadas,
      etiqueta: "Ventas realizadas",
      href: "/panel/ventas",
      acento: "azul",
    },
    {
      valor: resumen.productosActivos,
      etiqueta: "Productos activos",
      href: "/panel/productos",
      acento: "salvia",
    },
    {
      valor: resumen.productosBorrador,
      etiqueta: "Productos en borrador",
      href: "/panel/productos",
      acento: "gris",
    },
    {
      valor: resumen.productosDesactivados,
      etiqueta: "Productos desactivados",
      href: "/panel/productos",
      acento: "gris",
    },
    {
      valor: resumen.colecciones,
      etiqueta: "Colecciones",
      href: "/panel/colecciones",
      acento: "azul",
    },
    {
      valor: resumen.categorias,
      etiqueta: "Categorías",
      href: "/panel/categorias",
      acento: "gris",
    },
    {
      valor: resumen.produccionesActivas,
      etiqueta: "Producciones activas",
      href: "/panel/inventario?seccion=produccion&estado=activa",
      acento: "azul",
    },
  ];

  return (
    <section className="panel-dashboard">
      <header className="panel-dashboard__encabezado">
        <div>
          <p className="panel-dashboard__eyebrow">Centro de operaciones</p>
          <h1>Resumen</h1>
          <p className="introduccion">
            Una lectura rápida del catálogo, las ventas y lo que necesita atención hoy.
          </p>
        </div>
        <div className="panel-dashboard__estado" aria-label="Estado del panel">
          <span className="panel-dashboard__estado-punto" aria-hidden="true" />
          <span>
            <strong>Panel activo</strong>
            <small>Catálogo y operación en un solo lugar</small>
          </span>
        </div>
      </header>

      <section className="panel-dashboard__pulso" aria-label="Pulso operativo">
        <div className="panel-dashboard__pulso-principal">
          <p>Prioridad de hoy</p>
          <strong>
            {resumen.pedidosPendientes > 0
              ? `${resumen.pedidosPendientes} pedidos requieren revisión`
              : "No hay pedidos pendientes"}
          </strong>
          <Link href="/panel/pedidos?estado=pendiente">
            Revisar pedidos <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="panel-dashboard__pulso-dato">
          <span>Inventario</span>
          <strong>{resumen.productosStockBajo.length}</strong>
          <small>productos con stock bajo</small>
        </div>
        <div className="panel-dashboard__pulso-dato">
          <span>Producción</span>
          <strong>{resumen.produccionesActivas}</strong>
          <small>producciones activas</small>
        </div>
      </section>

      <div className="panel-dashboard__contenido">
        <section className="panel-dashboard__indicadores">
          <div className="panel-dashboard__bloque-cabecera">
            <div>
              <p className="seccion__etiqueta">Lectura rápida</p>
              <h2>Estado del negocio</h2>
            </div>
            <span>{tarjetas.length} indicadores</span>
          </div>

          <ul className="resumen-tarjetas">
            {tarjetas.map((tarjeta) => (
              <li
                key={tarjeta.etiqueta}
                className={`resumen-tarjeta resumen-tarjeta--${tarjeta.acento} ${tarjeta.destacado ? "resumen-tarjeta--destacada" : ""}`}
              >
                <Link href={tarjeta.href} className="resumen-tarjeta__enlace">
                  <span className="resumen-tarjeta__valor">{tarjeta.valor}</span>
                  <span className="resumen-tarjeta__etiqueta">{tarjeta.etiqueta}</span>
                  <span className="resumen-tarjeta__flecha" aria-hidden="true">
                    ↗
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel-dashboard__stock">
          <div className="panel-dashboard__bloque-cabecera">
            <div>
              <p className="seccion__etiqueta">Inventario</p>
              <h2>Stock bajo</h2>
            </div>
            <Link href="/panel/inventario">
              Ver inventario <span aria-hidden="true">→</span>
            </Link>
          </div>
          {resumen.productosStockBajo.length > 0 ? (
            <ul className="resumen-lista">
              {resumen.productosStockBajo.map((producto) => (
                <li key={producto.id}>
                  <span>
                    <strong>{producto.nombre}</strong>
                    <small>{producto.codigo_interno}</small>
                  </span>
                  <span className="resumen-lista__stock">{producto.stock_actual} unidades</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="panel-dashboard__vacio">Sin productos con stock bajo.</p>
          )}
        </section>

        <aside className="panel-dashboard__atajos">
          <div className="panel-dashboard__bloque-cabecera">
            <div>
              <p className="seccion__etiqueta">Accesos</p>
              <h2>Atajos de trabajo</h2>
            </div>
          </div>
          <nav aria-label="Atajos de trabajo">
            <Link href="/panel/pedidos">
              <span>Gestionar pedidos</span>
              <span aria-hidden="true">↗</span>
            </Link>
            <Link href="/panel/productos">
              <span>Actualizar productos</span>
              <span aria-hidden="true">↗</span>
            </Link>
            <Link href="/catalogo">
              <span>Ver catálogo público</span>
              <span aria-hidden="true">↗</span>
            </Link>
          </nav>
        </aside>
      </div>
    </section>
  );
}
