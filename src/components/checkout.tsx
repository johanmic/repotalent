"use client"
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { useCallback } from "react"

import { postStripeSession } from "@actions/stripe"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY as string)
export const CheckoutForm = ({ productId }: { productId: string }) => {
  const fetchClientSecret = useCallback(async () => {
    const stripeResponse = await postStripeSession({
      productId,
      isSubscription: false,
    })
    return stripeResponse.clientSecret
  }, [productId])
  if (!productId) return null
  const options = { fetchClientSecret }

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
