"use client"
import { useState, useCallback, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useDebounce } from "@/hooks/use-debounce"
import { validatePromoCode, usePromoCode } from "@/app/actions/promo"
import { Icon } from "@/components/icon"
export const PromoCode = () => {
  const [code, setCode] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [valid, setValid] = useState(false)
  const debouncedCode = useDebounce(code, 1000)
  const [purchased, setPurchased] = useState<{
    creditsBought: number
  } | null>(null)
  const handleValidate = useCallback(async () => {
    setLoading(true)
    const { valid, message } = await validatePromoCode({ code })
    if (valid) {
      setError("")
      setMessage(message)
      setValid(true)
    } else {
      setError(message)
      setValid(false)
    }
    setLoading(false)
  }, [code])

  const handleUsePromoCode = useCallback(async () => {
    setLoading(true)
    const creditPurchase = await usePromoCode({ code })
    setPurchased(creditPurchase)
    setMessage(message)
    setLoading(false)
  }, [code])

  useEffect(() => {
    if (debouncedCode.length > 2) {
      handleValidate()
    }
  }, [debouncedCode, handleValidate])
  if (purchased) {
    return (
      <div>
        <p>
          <strong>You now have {purchased.creditsBought} credits</strong>
        </p>
        <p>You can use these credits to post jobs</p>
      </div>
    )
  }
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
        <Button
          onClick={() => {
            if (valid) {
              handleUsePromoCode()
            } else {
              handleValidate()
            }
          }}
        >
          {valid ? "Use" : "Check"}
        </Button>
      </div>
      {purchased ? (
        <div>
          <p>You now have {purchased?.creditsBought} credits</p>
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
