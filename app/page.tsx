import { CatalogoCliente } from "@/components/tienda/CatalogoCliente"
import { PromoTicker } from "@/components/tienda/PromoTicker"
import { StoreFooter } from "@/components/tienda/StoreFooter"
import { TiendaShell } from "@/components/tienda/TiendaShell"
import { getStoreCatalog } from "@/lib/catalog"

export const dynamic = "force-dynamic"

export default async function Home() {
  const whatsappDigits = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ""
  const { categories, brands, products } = await getStoreCatalog()

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
