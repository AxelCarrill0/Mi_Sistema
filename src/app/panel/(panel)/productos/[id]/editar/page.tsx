import type { Metadata } from "next";
import { notFound } from "next/navigation";

import FormularioImagenesProducto from "@/components/panel/FormularioImagenesProducto";
import FormularioProducto from "@/components/panel/FormularioProducto";
import { actualizarProducto } from "@/lib/panel/acciones";
import {
  listarCategoriasPanel,
  listarColeccionesPanel,
  listarImagenesProducto,
  obtenerProductoPanel,
} from "@/lib/panel/consultas";
import { createClient } from "@/lib/supabase/server";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Editar producto",
};

export default async function EditarProductoPage({ params }: Props) {
  const { id } = await params;
  const cliente = await createClient();
  const producto = await obtenerProductoPanel(cliente, id);

  if (!producto) {
    notFound();
  }

  const [colecciones, categorias, imagenes] = await Promise.all([
    listarColeccionesPanel(cliente, {
      soloActivas: true,
      incluirId: producto.coleccion_id ?? undefined,
    }),
    listarCategoriasPanel(cliente, {
      soloActivas: true,
      incluirId: producto.categoria_id ?? undefined,
    }),
    listarImagenesProducto(cliente, id),
  ]);

  return (
    <section>
      <h1>Editar producto</h1>
      <FormularioProducto
        accion={actualizarProducto.bind(null, id)}
        colecciones={colecciones.map((coleccion) => ({
          id: coleccion.id,
          nombre: coleccion.nombre,
          activa: coleccion.estado_publicacion === "activo",
        }))}
        categorias={categorias.map((categoria) => ({
          id: categoria.id,
          nombre: categoria.nombre,
          activa: categoria.activo,
        }))}
        valoresIniciales={{
          nombre: producto.nombre,
          codigo_interno: producto.codigo_interno,
          descripcion: producto.descripcion ?? "",
          coleccion_id: producto.coleccion_id ?? "",
          categoria_id: producto.categoria_id ?? "",
          tipo_producto: producto.tipo_producto,
          precio_base: producto.precio_base !== null ? String(producto.precio_base) : "",
          controla_stock: producto.controla_stock,
          stock_actual: String(producto.stock_actual),
          materiales: producto.materiales ?? "",
          medidas: producto.medidas ?? "",
          colores_acabados: producto.colores_acabados ?? "",
          tiempo_elaboracion: producto.tiempo_elaboracion ?? "",
          estado_publicacion: producto.estado_publicacion,
          destacado: producto.destacado,
          mensaje_whatsapp: producto.mensaje_whatsapp ?? "",
        }}
      />
      <FormularioImagenesProducto productoId={id} imagenes={imagenes} />
    </section>
  );
}
