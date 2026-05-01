import Image from "next/image"

type Props = {
  /** Cabecera: 65px móvil / 80px desktop · Pie: 40px */
  variant: "header" | "footer"
  priority?: boolean
}

const HEADER_SHADOW = "0 2px 12px rgba(201, 169, 110, 0.4)"

export function StoreLogo({ variant, priority = false }: Props) {
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
