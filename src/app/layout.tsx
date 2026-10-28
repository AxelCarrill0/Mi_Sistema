import type { Metadata } from "next";
import { Manrope } from "next/font/google";

import "./globals.css";
import MarcoPublico from "@/components/publicos/MarcoPublico";
import { obtenerNombreNegocio } from "@/lib/catalogo/configuracion";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : undefined,
  title: {
    default: "FutureLife",
    template: "%s | FutureLife",
  },
  description: "Catálogo de artículos de madera y decoración.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nombreNegocio = await obtenerNombreNegocio();

  return (
    <html lang="es">
      <body className={manrope.variable}>
        <MarcoPublico nombreNegocio={nombreNegocio}>{children}</MarcoPublico>
      </body>
    </html>
  );
}
