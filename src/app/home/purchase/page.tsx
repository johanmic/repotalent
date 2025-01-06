import { Pricing } from "@/components/pricing"
import { PromoCode } from "@/components/promo-code"
import { getProducts } from "@/app/actions/product"
const PurchasePage = async () => {
  const plans = await getProducts()
  return (
    <div>
      <Pricing mode="purchase" plans={plans} />
      <div className="mt-4 flex justify-center">
        <PromoCode />
      </div>
    </div>
  )
}

export default PurchasePage
