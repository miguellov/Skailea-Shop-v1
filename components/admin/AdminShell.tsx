"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { ADMIN_SESSION_KEY } from "@/lib/admin-session"
import { SITE_PUBLIC_URL } from "@/lib/site"

const nav = [
  { href: "/admin/dashboard", label: "Resumen" },
  { href: "/admin/dashboard/reportes", label: "📊 Reportes" },
  { href: "/admin/dashboard/pedidos", label: "📥 Pedidos" },
  { href: "/admin/dashboard/categorias", label: "🏷️ Categorías" },
  { href: "/admin/dashboard/productos", label: "Productos" },
]

export function AdminShell({
  children,
  newOrdersCount = 0,
}: {
  children: ReactNode
  newOrdersCount?: number
}) {
  const pathname = usePathname()
  const router = useRouter()

  function logout() {
    sessionStorage.removeItem(ADMIN_SESSION_KEY)
    router.replace("/admin")
  }

  return (
    <div className="min-h-screen bg-skailea-cream text-skailea-deep">
      <header className="sticky top-0 z-20 border-b border-skailea-blush/50 bg-skailea-deep text-skailea-cream">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/admin/dashboard" className="font-serif text-lg font-semibold">
            Skailea <span className="text-skailea-gold">Admin</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-1 sm:gap-2">
            {nav.map((item) => {
              const active =
                item.href === "/admin/dashboard"
                  ? pathname === item.href
                  : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    active
                      ? "bg-skailea-rose text-skailea-cream"
                      : "text-skailea-cream/85 hover:bg-skailea-cream/10"
                  }`}
                >
                  {item.label}
                  {item.href === "/admin/dashboard/pedidos" && newOrdersCount > 0 && (
                    <span className="min-w-[1.25rem] rounded-full bg-skailea-cream px-1.5 text-center text-[10px] font-bold text-skailea-deep">
                      {newOrdersCount > 99 ? "99+" : newOrdersCount}
                    </span>
                  )}
                </Link>
              )
            })}
            <a
              href={SITE_PUBLIC_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full px-3 py-1.5 text-sm text-skailea-cream/75 hover:bg-skailea-cream/10"
            >
              Ver tienda
            </a>
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-skailea-cream/25 px-3 py-1.5 text-sm text-skailea-cream/90 hover:bg-skailea-cream/10"
            >
              Salir
            </button>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</div>
    </div>
  )
}
