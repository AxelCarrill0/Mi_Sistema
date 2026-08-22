import type { MetadataRoute } from "next";

import { obtenerUrlBase } from "@/lib/catalogo/origen";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = await obtenerUrlBase();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/panel", "/api"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
