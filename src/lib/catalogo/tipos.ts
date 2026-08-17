import type { Database } from "@/lib/supabase/database.types";

export type { Database };

export type ColeccionPublica = Database["public"]["Tables"]["colecciones"]["Row"];
export type CategoriaPublica = Database["public"]["Tables"]["categorias"]["Row"];
export type ProductoPublico = Database["public"]["Tables"]["productos"]["Row"];
export type ImagenProductoPublica = Database["public"]["Tables"]["imagenes_producto"]["Row"];

export type TipoProducto = "disponible" | "bajo_pedido" | "personalizado";

export type OrdenProductos =
  "recientes" | "nombre_asc" | "nombre_desc" | "precio_asc" | "precio_desc";

export interface ProductoConImagenes extends ProductoPublico {
  imagenes: ImagenProductoPublica[];
}

export interface ProductoConDetalle extends ProductoPublico {
  coleccion: Pick<ColeccionPublica, "id" | "nombre" | "slug"> | null;
  categoria: Pick<CategoriaPublica, "id" | "nombre" | "slug"> | null;
  imagenes: ImagenProductoPublica[];
}
