import { headers } from "next/headers";

// Resuelve el origen público del sitio a partir de la petición actual, con
// respaldo en variables de entorno. Evita generar URLs de localhost en
// producción cuando no hay configuración explícita.
export async function obtenerOrigenActual(): Promise<string | null> {
  const cabeceras = await headers();
  const host = cabeceras.get("x-forwarded-host") ?? cabeceras.get("host");

  if (!host) {
    return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ?? null;
  }

  const protocolo =
    cabeceras.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");

  return `${protocolo}://${host}`;
}

// Variante con respaldo final a localhost, para archivos técnicos como
// sitemap.ts y robots.ts donde siempre se necesita una URL absoluta.
export async function obtenerUrlBase(): Promise<string> {
  return (
    (await obtenerOrigenActual()) ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}
