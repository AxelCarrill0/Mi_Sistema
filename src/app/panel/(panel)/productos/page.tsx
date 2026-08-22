import type { Metadata } from "next";
import Link from "next/link";

import Paginacion from "@/components/Paginacion";
import { obtenerEtiquetaTipoProducto } from "@/lib/catalogo/opciones";
import { cambiarEstadoProducto } from "@/lib/panel/acciones";
import { listarProductosPanel } from "@/lib/panel/consultas";
import { formatearMonedaUSD } from "@/lib/panel/formato";
import { obtenerNumeroPagina, TAMANO_PAGINA_PANEL } from "@/lib/paginacion";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Productos",
};

interface Props {
  searchParams: Promise<{ pagina?: string | string[] }>;
}

const ETIQUETA_ESTADO: Record<string, string> = {
  borrador: "Borrador",
  activo: "Activo",
  desactivado: "Desactivado",
};

export default async function ProductosPanelPage({ searchParams }: Props) {
  const { pagina: paginaParametro } = await searchParams;
  const pagina = obtenerNumeroPagina(paginaParametro);
  const cliente = await createClient();
  const { filas: productos, total } = await listarProductosPanel(cliente, { pagina });

  return (
    <section>
      <div className="panel-titulo">
        <h1>Productos</h1>
        <Link href="/panel/productos/nuevo" className="boton boton--primario">
          Nuevo producto
        </Link>
      </div>

      {productos.length === 0 ? (
        <p className="mensaje-estado">Aún no hay productos.</p>
      ) : (
        <>
          <div className="panel-tabla">
            <div className="panel-tabla__encabezado">
              <span>Código</span>
              <span>Producto</span>
              <span>Tipo</span>
              <span>Colección / Categoría</span>
              <span>Stock</span>
              <span>Precio</span>
              <span>Estado</span>
              <span>Acciones</span>
            </div>
            {productos.map((producto) => (
              <div className="panel-tabla__fila" key={producto.id}>
                <span>{producto.codigo_interno}</span>
                <span>
                  {producto.nombre}
                  {producto.destacado ? <span className="panel-etiqueta">Destacado</span> : null}
                </span>
                <span>{obtenerEtiquetaTipoProducto(producto.tipo_producto)}</span>
                <span>
                  {producto.coleccion ? producto.coleccion.nombre : "—"} /{" "}
                  {producto.categoria ? producto.categoria.nombre : "—"}
                </span>
                <span>
                  {producto.controla_stock ? `${producto.stock_actual} uds` : "No controla"}
                </span>
                <span>
                  {producto.precio_base !== null ? formatearMonedaUSD(producto.precio_base) : "—"}
                </span>
                <span>
                  <span
                    className={`panel-etiqueta ${
                      producto.estado_publicacion !== "activo" ? "panel-etiqueta--apagada" : ""
                    }`}
                  >
                    {ETIQUETA_ESTADO[producto.estado_publicacion] ?? producto.estado_publicacion}
                  </span>
                </span>
                <span className="panel-lista__acciones">
                  <Link
                    href={`/panel/productos/${producto.id}/editar`}
                    className="boton boton--secundario"
                  >
                    Editar
                  </Link>
                  <form action={cambiarEstadoProducto}>
                    <input type="hidden" name="id" value={producto.id} />
                    <input
                      type="hidden"
                      name="estado"
                      value={producto.estado_publicacion === "activo" ? "desactivado" : "activo"}
                    />
                    <button type="submit" className="boton boton--secundario">
                      {producto.estado_publicacion === "activo" ? "Desactivar" : "Publicar"}
                    </button>
                  </form>
                </span>
              </div>
            ))}
          </div>
          <Paginacion
            pagina={pagina}
            total={total}
            porPagina={TAMANO_PAGINA_PANEL}
            construirHref={(siguiente) => `/panel/productos?pagina=${siguiente}`}
          />
        </>
      )}
    </section>
  );
}
