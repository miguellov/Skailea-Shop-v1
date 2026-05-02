"use client"

import Image from "next/image"
import { useState } from "react"
import {
  SITE_TAGLINE,
  SITE_WHATSAPP_DIGITS_DEFAULT,
  WA_FLOAT_MESSAGE,
  waComingSoonNotifyMessage,
} from "@/lib/site"
import { whatsappUrl } from "@/lib/utils"

function digitsFromEnv(): string {
  const fromEnv = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim()
  if (fromEnv) return fromEnv.replace(/\D/g, "")
  return SITE_WHATSAPP_DIGITS_DEFAULT
}

export function ComingSoonClient() {
  const [whatsappHint, setWhatsappHint] = useState("")

  const notifyHref = whatsappUrl(
    digitsFromEnv(),
    waComingSoonNotifyMessage(whatsappHint.trim() || undefined)
  )

  const consultHref = whatsappUrl(digitsFromEnv(), WA_FLOAT_MESSAGE)

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-skailea-cream px-4 py-12 text-skailea-deep">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-8 inline-flex overflow-hidden rounded-full border-[3px] border-skailea-gold bg-white shadow-lg shadow-skailea-deep/15">
          <Image
            src="/logo.png"
            alt="Skailea Shop"
            width={280}
            height={70}
            className="h-auto w-[min(100%,280px)]"
            priority
          />
        </div>

        <h1 className="font-playfair text-4xl font-semibold tracking-tight text-skailea-deep sm:text-5xl">
          Próximamente
        </h1>
        <p className="mt-3 font-medium text-skailea-gold">{SITE_TAGLINE}</p>
        <p className="mt-6 text-base leading-relaxed text-skailea-charcoal/85">
          Estamos preparando algo especial para ti 🛍️
        </p>

        <div className="mt-10 rounded-2xl border border-skailea-blush/50 bg-white/90 p-5 text-left shadow-sm">
          <label htmlFor="coming-soon-wa" className="block text-sm font-medium text-skailea-deep">
            Tu WhatsApp <span className="font-normal text-skailea-charcoal/65">(opcional)</span>
          </label>
          <input
            id="coming-soon-wa"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="Ej. 829 694 9181"
            value={whatsappHint}
            onChange={(e) => setWhatsappHint(e.target.value)}
            className="mt-2 w-full rounded-xl border border-skailea-blush/60 bg-skailea-cream px-3 py-2.5 text-sm text-skailea-deep outline-none ring-skailea-rose/30 placeholder:text-skailea-charcoal/40 focus:border-skailea-rose/50 focus:ring-2"
          />
          <p className="mt-2 text-xs text-skailea-charcoal/65">
            Te abrimos un chat para avisarte cuando la tienda esté lista.
          </p>
          <a
            href={notifyHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex w-full items-center justify-center rounded-full bg-skailea-rose py-3 text-sm font-semibold text-skailea-cream shadow-md transition hover:brightness-105"
          >
            Avísame por WhatsApp
          </a>
        </div>

        <p className="mt-8 text-sm text-skailea-charcoal/70">
          ¿Consulta?{" "}
          <a
            href={consultHref}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-skailea-rose underline-offset-2 hover:underline"
          >
            Escríbenos
          </a>
        </p>
      </div>
    </div>
  )
}
