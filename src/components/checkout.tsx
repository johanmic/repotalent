"use client"
import React, { useCallback, useState, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js"

import { postStripeSession } from "@actions/stripe"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY as string)
export const CheckoutForm = ({ productId }: { productId: string }) => {
  if (!productId) return null
  const fetchClientSecret = useCallback(async () => {
    const stripeResponse = await postStripeSession({
      productId,
      isSubscription: false,
    })
    return stripeResponse.clientSecret
  }, [productId])

  const options = { fetchClientSecret }

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
