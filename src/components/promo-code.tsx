"use client"
import { useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useDebounce } from "@/hooks/use-debounce"
import { usePromoCode } from "@/app/actions/promo"
import { Icon } from "@/components/icon"

export const PromoCode = () => {
  const [code, setCode] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [purchased, setPurchased] = useState<{
    creditsBought: number
  } | null>(null)

  const debouncedCode = useDebounce(code, 1000)

  const handleUsePromoCode = useCallback(async () => {
    setLoading(true)
    try {
      const purchase = await usePromoCode({ code })
      setPurchased(purchase)
      setMessage("Promo code applied successfully!")
      setError(null)
    } catch (err: any) {
      setError(err.message)
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
