import { ClickableBadge } from "@/components/clickable-badge"

interface PromoContent {
  message: string
  code: string
  color: string
  mobileMessage?: string
  postMessage?: string
  expires: string
}

const PROMO_MAP: Record<string, PromoContent> = {
  producthunt: {
    message: "Hello ProductHunter",
    mobileMessage: "PH hunter 10% off",
    postMessage: "code in checkout for 10% off",
    code: "PHONBOARD2025",
    color: "bg-rose-500",
    expires: "2025-02-28",
  },
  hackernews: {
    message: "Hello HackerNewser use ",
    mobileMessage: "HN user",
    postMessage: "for 3 free credits",
    code: "HACKERNEWS_001",
    color: "bg-orange-500",
    expires: "2025-02-28",
  },
  "r-sideproject": {
    message: "Hello R/SideProject",
    mobileMessage: "R/SideProject user",
    postMessage: "code in checkout for 10% off",
    code: "RSIDEPROJECT2025",
    color: "bg-black",
    expires: "2025-02-28",
  },
}

export const LandingBanner = ({
  promoRef,
}: {
  promoRef?: string | null | undefined
}) => {
  if (!promoRef || !(promoRef in PROMO_MAP)) return null

  const promo = PROMO_MAP[promoRef]
  const expires = new Date(promo.expires)
  const isExpired = expires < new Date()
  if (isExpired) return null
  return (
    <div className="fixed top-0 left-0 right-0 w-full h-16 z-50">
      <div
        className={`font-bold ${promo.color} gap-2 flex items-center justify-center`}
      >
        <div className="text-white flex gap-2 px-4 py-2">
          <span className="hidden md:flex">{promo.message}</span>
          <span className="md:hidden">{promo.mobileMessage} use </span>
          <ClickableBadge text={promo.code}>{promo.code}</ClickableBadge>
          <span className="text-white hidden md:flex">{promo.postMessage}</span>
        </div>
      </div>
    </div>
  )
}
