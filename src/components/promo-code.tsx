"use client"
import { redeemPromoCode } from "@/app/actions/promo"
import { Icon } from "@/components/icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCallback, useState } from "react"
import { toast } from "sonner"
export const PromoCode = () => {
  const [code, setCode] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [purchased, setPurchased] = useState<{
    creditsBought: number
  } | null>(null)

  const handleUsePromoCode = useCallback(async () => {
    setLoading(true)
    try {
      const { success, purchase, error } = await redeemPromoCode({ code })
      if (success) {
        setPurchased(purchase)
        setMessage("Promo code applied successfully!")
        setError(null)
      } else {
        toast.error(error || "An unexpected error occurred")
        setError(error || "An unexpected error occurred")
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      )
      setMessage(null)
    } finally {
      setLoading(false)
      setCode("")
    }
  }, [code])

  return (
    <div className="flex flex-col gap-2 items-center">
      <p>Got a promo code?</p>
      <div className="flex flex-row gap-2">
        <Input
          type="text"
          placeholder="Enter your promo code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <Button onClick={handleUsePromoCode} disabled={loading}>
          {loading ? "Processing..." : "Apply"}
        </Button>
      </div>
      {purchased ? (
        <div>
          <p>You now have {purchased.creditsBought} credits</p>
          <p>You can use these credits to post jobs</p>
        </div>
      ) : (
        <div>
          <p>
            {error ? (
              <span className="text-red-500">{error} 😵‍💫</span>
            ) : message ? (
              <span className="text-green-500 flex flex-row gap-2 items-center">
                {message} <Icon name="check" />
              </span>
            ) : null}
          </p>
        </div>
      )}
    </div>
  )
}
