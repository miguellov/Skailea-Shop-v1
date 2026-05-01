"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, type ReactNode } from "react"
import { ADMIN_SESSION_KEY, isAdminSessionMarked } from "@/lib/admin-session"

export function AdminAuthGate({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const ok = isAdminSessionMarked(sessionStorage.getItem(ADMIN_SESSION_KEY))
    if (!ok) {
      router.replace("/admin")
      return
    }
    setReady(true)
  }, [router])

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-skailea-deep text-skailea-cream">
        <p className="text-sm opacity-80">Comprobando sesión…</p>
      </div>
    )
  }

  return <>{children}</>
}
