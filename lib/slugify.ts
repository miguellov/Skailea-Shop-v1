/** Slug URL-safe para categorías (es-DO, sin acentos conflictivos). */
export function slugifyCategoryName(name: string): string {
  const t = name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return t || "categoria"
}
