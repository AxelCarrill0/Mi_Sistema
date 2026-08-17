"use client";

import Image from "next/image";
import { useState } from "react";

import { obtenerUrlPublicaImagen } from "@/lib/catalogo/imagenes";
import type { ImagenProductoPublica } from "@/lib/catalogo/tipos";

interface Props {
  imagenes: ImagenProductoPublica[];
  nombreProducto: string;
}

export default function GaleriaProducto({ imagenes, nombreProducto }: Props) {
  const [indiceActivo, setIndiceActivo] = useState(0);
  const imagenActiva = imagenes[indiceActivo];

  return (
    <div className="galeria">
      <div className="galeria__principal">
        <Image
          src={obtenerUrlPublicaImagen(imagenActiva.ruta_storage)}
          alt={imagenActiva.texto_alternativo ?? nombreProducto}
          fill
          sizes="(min-width: 900px) 45vw, 100vw"
        />
      </div>
      {imagenes.length > 1 ? (
        <ul className="galeria__miniaturas">
          {imagenes.map((imagen, indice) => (
            <li key={imagen.id}>
              <button
                type="button"
                className={`galeria__miniatura ${
                  indice === indiceActivo ? "galeria__miniatura--activa" : ""
                }`}
                onClick={() => setIndiceActivo(indice)}
                aria-label={`Ver imagen ${indice + 1} de ${imagenes.length}`}
              >
                <Image
                  src={obtenerUrlPublicaImagen(imagen.ruta_storage)}
                  alt={imagen.texto_alternativo ?? nombreProducto}
                  fill
                  sizes="64px"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
