import Link from "next/link";

import { ORDENES_DISPONIBLES } from "@/lib/catalogo/opciones";
import type { CategoriaPublica, ColeccionPublica, OrdenProductos } from "@/lib/catalogo/tipos";

export interface ValoresFiltros {
  busqueda: string;
  coleccion: string;
  categoria: string;
  orden: OrdenProductos;
  tieneFiltros: boolean;
}

interface Props {
  colecciones: ColeccionPublica[];
  categorias: CategoriaPublica[];
  valores: ValoresFiltros;
}

export default function FormularioFiltros({ colecciones, categorias, valores }: Props) {
  return (
    <form className="filtros" action="/catalogo" method="get">
      <label className="filtros__campo">
        <span className="filtros__etiqueta">Buscar</span>
        <input
          className="filtros__entrada"
          type="search"
          name="q"
          defaultValue={valores.busqueda}
          placeholder="Nombre, código o descripción"
        />
      </label>

      <label className="filtros__campo">
        <span className="filtros__etiqueta">Colección</span>
        <select className="filtros__entrada" name="coleccion" defaultValue={valores.coleccion}>
          <option value="">Todas</option>
          {colecciones.map((coleccion) => (
            <option key={coleccion.id} value={coleccion.slug}>
              {coleccion.nombre}
            </option>
          ))}
        </select>
      </label>

      <label className="filtros__campo">
        <span className="filtros__etiqueta">Categoría</span>
        <select className="filtros__entrada" name="categoria" defaultValue={valores.categoria}>
          <option value="">Todas</option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.slug}>
              {categoria.nombre}
            </option>
          ))}
        </select>
      </label>

      <label className="filtros__campo">
        <span className="filtros__etiqueta">Ordenar por</span>
        <select className="filtros__entrada" name="orden" defaultValue={valores.orden}>
          {ORDENES_DISPONIBLES.map((opcion) => (
            <option key={opcion.valor} value={opcion.valor}>
              {opcion.etiqueta}
            </option>
          ))}
        </select>
      </label>

      <div className="filtros__acciones">
        <button className="boton boton--primario" type="submit">
          Aplicar filtros
        </button>
        {valores.tieneFiltros ? (
          <Link className="filtros__limpiar" href="/catalogo">
            Limpiar filtros
          </Link>
        ) : null}
      </div>
    </form>
  );
}
