import type { Database } from "@/lib/supabase/database.types";

export type RolPanel = "administrador" | "operador";

export interface UsuarioAutorizado {
  id: string;
  email: string;
  rol: RolPanel;
}

export interface ProductoStockBajo {
  id: string;
  codigo_interno: string;
  nombre: string;
  stock_actual: number;
}

export interface ResumenPanel {
  productosActivos: number;
  productosBorrador: number;
  productosDesactivados: number;
  colecciones: number;
  categorias: number;
  productosStockBajo: ProductoStockBajo[];
}

export type TablaPanel = keyof Pick<
  Database["public"]["Tables"],
  "productos" | "colecciones" | "categorias" | "perfiles"
>;
