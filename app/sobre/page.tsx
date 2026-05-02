import Link from "next/link"
import { StoreFooter } from "@/components/tienda/StoreFooter"
import { TiendaShell } from "@/components/tienda/TiendaShell"
import {
  SITE_EMAIL,
  SITE_INSTAGRAM_HANDLE,
  SITE_INSTAGRAM_URL,
  SITE_LOCATION,
  SITE_NAME,
  SITE_PHONE_DISPLAY,
  SITE_TAGLINE,
  getWhatsAppDigitsFromEnv,
} from "@/lib/site"
import { whatsappUrl } from "@/lib/utils"

export const metadata = {
  title: "Sobre nosotros | Skailea Shop",
  description:
    "Skailea Shop — Tu Aroma Deja Huella. Belleza y fragancias en Sosúa, Puerto Plata, RD.",
}

export default function SobrePage() {
  const whatsappDigits = getWhatsAppDigitsFromEnv()
  const waHref = whatsappUrl(whatsappDigits, "Hola Skailea Shop! 👋")

  return (
    <TiendaShell whatsappDigits={whatsappDigits}>
      <div className="min-h-screen bg-skailea-cream font-sans text-skailea-deep">
        <header className="border-b border-skailea-blush/35 bg-white/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
            <Link
              href="/"
              className="text-sm font-semibold text-skailea-rose hover:underline"
            >
              ← Volver a la tienda
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-skailea-gold">
            {SITE_NAME}
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-skailea-deep sm:text-4xl">
            {SITE_TAGLINE}
          </h1>
          <p className="mt-6 text-base leading-relaxed text-skailea-charcoal/85">
            Somos una tienda de belleza y fragancias en{" "}
            <strong className="text-skailea-deep">{SITE_LOCATION}</strong>.
            Trabajamos con marcas reconocidas y pedidos cómodos por WhatsApp.
          </p>

          <section className="mt-10 space-y-4 rounded-2xl border border-skailea-blush/40 bg-white/90 p-6 shadow-sm">
            <h2 className="font-serif text-lg font-semibold text-skailea-deep">
              Contacto
            </h2>
            <ul className="space-y-3 text-sm text-skailea-charcoal/90">
              <li>
                <span className="font-medium text-skailea-deep">Ubicación:</span>{" "}
                {SITE_LOCATION}
              </li>
              <li>
                <span className="font-medium text-skailea-deep">Instagram:</span>{" "}
                <a
                  href={SITE_INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-skailea-rose underline-offset-2 hover:underline"
                >
                  {SITE_INSTAGRAM_HANDLE}
                </a>
              </li>
              <li>
                <span className="font-medium text-skailea-deep">Email:</span>{" "}
                <a
                  href={`mailto:${SITE_EMAIL}`}
                  className="text-skailea-rose underline-offset-2 hover:underline"
                >
                  {SITE_EMAIL}
                </a>
              </li>
              <li>
                <span className="font-medium text-skailea-deep">WhatsApp:</span>{" "}
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-skailea-rose underline-offset-2 hover:underline"
                >
                  {SITE_PHONE_DISPLAY}
                </a>
              </li>
            </ul>
          </section>
        </main>

        <StoreFooter />
      </div>
    </TiendaShell>
  )
}
