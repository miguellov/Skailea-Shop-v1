import { CatalogoCliente } from "@/components/tienda/CatalogoCliente"
import { PromoTicker } from "@/components/tienda/PromoTicker"
import { StoreFooter } from "@/components/tienda/StoreFooter"
import { TiendaShell } from "@/components/tienda/TiendaShell"
import { getStoreCatalog } from "@/lib/catalog"
import { getWhatsAppDigitsFromEnv } from "@/lib/site"

export const dynamic = "force-dynamic"

export default async function Home() {
  const whatsappDigits = getWhatsAppDigitsFromEnv()
  const { categories, brands, products } = await getStoreCatalog()
  console.log("[page.tsx] catálogo listo — productos:", products.length)

  return (
    <TiendaShell whatsappDigits={whatsappDigits}>
      <div className="min-h-screen bg-skailea-cream font-sans text-skailea-deep">
        <PromoTicker />
        <CatalogoCliente
          categories={categories}
          brands={brands}
          products={products}
          whatsappDigits={whatsappDigits}
        />
        <StoreFooter />
      </div>
    </TiendaShell>
  )
}
