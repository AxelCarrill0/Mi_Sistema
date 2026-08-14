import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "FutureLife",
  description: "Catálogo y gestión comercial de FutureLife.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
