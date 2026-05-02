import Image from "next/image"

type Props = {
  /** Cabecera: pill (barra) o circle · Pie: 40px */
  variant: "header" | "footer"
  /** Solo `header`: logo recortado en círculo */
  headerShape?: "pill" | "circle"
  priority?: boolean
}

const HEADER_SHADOW = "0 2px 12px rgba(232, 160, 180, 0.45)"

export function StoreLogo({
  variant,
  headerShape = "pill",
  priority = false,
}: Props) {
  if (variant === "footer") {
    return (
      <div
        className="inline-flex shrink-0 overflow-hidden rounded-full bg-white"
        style={{
          borderWidth: 2,
          borderStyle: "solid",
          borderColor: "var(--gold)",
        }}
      >
        <Image
          src="/logo.png"
          alt="Skailea Shop"
          width={160}
          height={40}
          className="max-w-none"
          style={{ width: "auto", height: 40 }}
        />
      </div>
    )
  }

  if (headerShape === "circle") {
    return (
      <div
        className="relative h-[4.25rem] w-[4.25rem] shrink-0 overflow-hidden rounded-full bg-white sm:h-[4.75rem] sm:w-[4.75rem] md:h-[5.25rem] md:w-[5.25rem]"
        style={{
          borderWidth: 3,
          borderStyle: "solid",
          borderColor: "var(--gold)",
          boxShadow: HEADER_SHADOW,
        }}
      >
        <Image
          src="/logo.png"
          alt="Skailea Shop"
          fill
          className="object-contain p-1.5 sm:p-2"
          sizes="(max-width: 640px) 68px, (max-width: 768px) 76px, 84px"
          priority={priority}
        />
      </div>
    )
  }

  return (
    <div
      className="inline-flex shrink-0 overflow-hidden rounded-full bg-white"
      style={{
        borderWidth: 3,
        borderStyle: "solid",
        borderColor: "var(--gold)",
        boxShadow: HEADER_SHADOW,
      }}
    >
      <Image
        src="/logo.png"
        alt="Skailea Shop"
        width={320}
        height={80}
        className="max-w-none h-[65px] w-auto md:h-[80px]"
        priority={priority}
      />
    </div>
  )
}
