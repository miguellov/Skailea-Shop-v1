import { ComingSoonClient } from "@/components/tienda/ComingSoonClient"

export const metadata = {
  title: "Próximamente | Skailea Shop",
  description:
    "Skailea Shop — Tu Aroma Deja Huella. Estamos preparando la tienda en Sosúa, Puerto Plata.",
  robots: {
    index: false,
    follow: true,
  },
}

export default function ComingSoonPage() {
  return <ComingSoonClient />
}
