"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { obtenerUrlPublicaImagen } from "@/lib/catalogo/imagenes";
import {
  cambiarImagenPrincipal,
  eliminarImagenProducto,
  subirImagenProducto,
} from "@/lib/panel/imagenes";
import type { ImagenProductoPanel } from "@/lib/panel/consultas";

interface Props {
  productoId: string;
  imagenes: ImagenProductoPanel[];
}

export default function FormularioImagenesProducto({ productoId, imagenes }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pendiente, setPendiente] = useState(false);

  async function manejarSubida(formData: FormData) {
    setPendiente(true);
    setError(null);
    const resultado = await subirImagenProducto(productoId, formData);
    setPendiente(false);
    setError(resultado.error ?? null);
    if (!resultado.error) {
      router.refresh();
    }
  }

  return (
    <div className="imagenes-producto">
      <h2>Imágenes</h2>

      {error ? (
        <p role="alert" className="formulario__error">
          {error}
        </p>
      ) : null}

      {imagenes.length === 0 ? (
        <p className="mensaje-estado">Este producto aún no tiene imágenes.</p>
      ) : (
        <ul className="imagenes-producto__grilla">
          {imagenes.map((imagen) => (
            <li
              key={imagen.id}
              className={`imagenes-producto__miniatura ${
                imagen.es_principal ? "imagenes-producto__miniatura--principal" : ""
              }`}
            >
              <Image
                src={obtenerUrlPublicaImagen(imagen.ruta_storage)}
                alt={imagen.texto_alternativo ?? ""}
                width={160}
                height={120}
                className="imagenes-producto__imagen"
              />
              <div className="imagenes-producto__acciones">
                {imagen.es_principal ? (
                  <span className="panel-etiqueta">Principal</span>
                ) : (
                  <form action={cambiarImagenPrincipal.bind(null, imagen.id)}>
                    <button type="submit" className="boton boton--secundario">
                      Hacer principal
                    </button>
                  </form>
                )}
                <form action={eliminarImagenProducto.bind(null, imagen.id)}>
                  <button type="submit" className="boton boton--peligro">
                    Eliminar
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form action={manejarSubida} className="imagenes-producto__subir">
        <input
          type="file"
          name="imagen"
          accept="image/jpeg,image/png,image/webp,image/avif"
          required
        />
        <button type="submit" className="boton boton--primario" disabled={pendiente}>
          {pendiente ? "Subiendo…" : "Subir imagen"}
        </button>
      </form>
      <p className="imagenes-producto__ayuda">JPG, PNG, WEBP o AVIF, máximo 5 MB.</p>
    </div>
  );
}
