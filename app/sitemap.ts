import type { MetadataRoute } from "next"
import { SITE_PUBLIC_URL } from "@/lib/site"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_PUBLIC_URL.replace(/\/$/, "")
  const now = new Date()
  return [
    {
      url: base,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/sobre`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ]
}
