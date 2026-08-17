import TarjetaProducto from "./TarjetaProducto";
import type { ProductoConImagenes } from "@/lib/catalogo/tipos";

interface Props {
  productos: ProductoConImagenes[];
  mensajeVacio?: string;
}

export default function ListaProductos({ productos, mensajeVacio }: Props) {
  if (productos.length === 0) {
    return (
      <p className="mensaje-estado" role="status">
        {mensajeVacio ?? "No se encontraron productos."}
      </p>
    );
  }

  return (
    <ul className="grilla-productos">
      {productos.map((producto) => (
        <li key={producto.id}>
          <TarjetaProducto producto={producto} />
        </li>
      ))}
    </ul>
  );
}
