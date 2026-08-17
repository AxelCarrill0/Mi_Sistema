import Image from "next/image";
import Link from "next/link";

import ListaProductos from "@/components/publicos/ListaProductos";
import { listarProductosPublicos } from "@/lib/catalogo/consultas";
import { obtenerUrlPublicaImagen } from "@/lib/catalogo/imagenes";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const cliente = await createClient();
  const destacados = await listarProductosPublicos(cliente, {
    soloDestacados: true,
    orden: "recientes",
    limite: 8,
  });

  const imagenHero = destacados[0]?.imagenes[0];
  const urlImagenHero = imagenHero ? obtenerUrlPublicaImagen(imagenHero.ruta_storage) : null;

  return (
    <section className="inicio">
      <div className="inicio__hero">
        <div className="inicio__hero-contenido">
          <p className="inicio__eyebrow">Piezas para vivir mejor</p>
          <h1>Diseño artesanal para espacios con intención</h1>
          <p className="inicio__descripcion">
            Descubre repisas, canastas, cuadros y piezas decorativas pensadas para acompañar tu
            hogar con sencillez y personalidad.
          </p>
          <div className="inicio__acciones">
            <Link className="boton boton--primario" href="/catalogo">
              Explorar catálogo
            </Link>
            <Link className="boton boton--texto" href="/colecciones">
              Ver colecciones
            </Link>
          </div>
          <div className="inicio__confianza" aria-label="Características del catálogo">
            <span>Hecho con cuidado</span>
            <span>Diseño atemporal</span>
            <span>Cotiza por WhatsApp</span>
          </div>
        </div>
        <div className="inicio__hero-imagen">
          {urlImagenHero ? (
            <Image
              src={urlImagenHero}
              alt={imagenHero?.texto_alternativo ?? destacados[0]?.nombre ?? "Pieza artesanal"}
              fill
              priority
              sizes="(min-width: 900px) 42vw, 100vw"
            />
          ) : (
            <div className="inicio__hero-placeholder">
              <span>Una colección hecha para tu espacio</span>
            </div>
          )}
        </div>
      </div>

      <div className="inicio__seccion">
        <div className="inicio__seccion-cabecera">
          <div>
            <p className="seccion__etiqueta">Selección actual</p>
            <h2 className="inicio__subtitulo">Piezas que hablan de tu hogar</h2>
          </div>
          <Link className="inicio__ver-todo" href="/catalogo">
            Ver todo el catálogo
          </Link>
        </div>
        <ListaProductos
          productos={destacados}
          mensajeVacio="Pronto publicaremos nuestros primeros productos."
        />
      </div>
    </section>
  );
}
