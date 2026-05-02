import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Skailea Shop | Tu Aroma Deja Huella",
  description:
    "Tienda de belleza y fragancias en Sosúa, Puerto Plata, República Dominicana. BBW, Victoria's Secret, Perfumes Árabes y más. Pedidos por WhatsApp.",
  keywords:
    "skailea shop, perfumes, BBW, Victoria Secret, Sosúa, Puerto Plata, República Dominicana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${dmSans.variable} ${playfair.variable} min-h-screen font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
