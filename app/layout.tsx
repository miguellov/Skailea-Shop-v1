import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const SITE_CANONICAL = "https://www.skaileashop.com";

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

const ogDescription =
  "Tienda de belleza y fragancias en Sosúa, Puerto Plata, RD.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CANONICAL),
  title: "Skailea Shop | Tu Aroma Deja Huella",
  description:
    "Tienda de belleza y fragancias en Sosúa, Puerto Plata, República Dominicana. BBW, Victoria's Secret, Perfumes Árabes y más. Pedidos por WhatsApp.",
  keywords:
    "perfumes, BBW, Bath and Body Works, Victoria Secret, fragancias, belleza, Sosúa, Puerto Plata, República Dominicana, colonias, splash",
  verification: {
    google: "-3WTfGYks95Iu-cgxLpunoK1U_ni9gmA2XQ6Pg47Vpk",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Skailea Shop | Tu Aroma Deja Huella",
    description: ogDescription,
    url: SITE_CANONICAL,
    siteName: "Skailea Shop",
    locale: "es_DO",
    type: "website",
    images: [{ url: "/logo.png", width: 500, height: 500 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Skailea Shop | Tu Aroma Deja Huella",
    description: ogDescription,
    images: ["/logo.png"],
  },
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
