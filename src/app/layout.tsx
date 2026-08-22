import type { Metadata } from "next";
import { Manrope } from "next/font/google";

import "./globals.css";
import MarcoPublico from "@/components/publicos/MarcoPublico";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={manrope.variable}>
        <MarcoPublico>{children}</MarcoPublico>
      </body>
    </html>
  );
}
