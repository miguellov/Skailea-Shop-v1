import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { SITE_PUBLIC_URL } from "@/lib/site";

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
  "Belleza y fragancias en Sosúa, Puerto Plata, RD. BBW, Victoria's Secret y más.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_PUBLIC_URL),
  title: "Skailea Shop | Tu Aroma Deja Huella",
  description:
    "Tienda de belleza y fragancias en Sosúa, Puerto Plata, República Dominicana. BBW, Victoria's Secret, Perfumes Árabes y más. Pedidos por WhatsApp.",
  keywords:
    "skailea shop, perfumes, BBW, Victoria Secret, Sosúa, Puerto Plata, República Dominicana",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "es_DO",
    url: SITE_PUBLIC_URL,
    siteName: "Skailea Shop",
    title: "Skailea Shop | Tu Aroma Deja Huella",
    description: ogDescription,
    images: [{ url: "/logo.png", width: 500, height: 500, alt: "Skailea Shop" }],
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
