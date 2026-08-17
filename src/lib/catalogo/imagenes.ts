const BUCKET_CATALOGO = "catalogo";

export function obtenerUrlPublicaImagen(ruta: string): string {
  const urlBase = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!urlBase) {
    return "";
  }

  const rutaCodificada = ruta.split("/").map(encodeURIComponent).join("/");
  return `${urlBase}/storage/v1/object/public/${BUCKET_CATALOGO}/${rutaCodificada}`;
}
