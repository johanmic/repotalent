import { Pricing } from "@/components/pricing"
import { PromoCode } from "@/components/promo-code"
const PurchasePage = async () => {
  return (
    <div>
      <Pricing mode="purchase" />
      <div className="mt-4 flex justify-center">
        <PromoCode />
      </div>
    </div>
  )
}

export default PurchasePage
