"use server"

import { Stripe } from "stripe"
import prisma from "@/store/prisma"
const apiKey = process.env.STRIPE_SECRET_KEY as string
console.log("apiKey", apiKey)
const stripe = new Stripe(apiKey)

interface NewSessionOptions {
  productId: string
  isSubscription: boolean
}

export const postStripeSession = async ({ productId }: NewSessionOptions) => {
  try {
    const returnUrl =
      "http://localhost:3000/home/checkout-return?session_id={CHECKOUT_SESSION_ID}"
    const product = await stripe.products.retrieve(productId)
    console.log("product", product)
    if (!product.default_price) throw new Error("Product has no default price")
    const price = await stripe.prices.retrieve(product.default_price as string)
    console.log("price", price)
    const creditPackage = await prisma.creditPackage.findFirst({
      where: {
        stripeId: product.default_price as string,
      },
    })
    if (!creditPackage) throw new Error("Credit package not found")
    if (price.recurring) {
      // Create a session for a subscription
      const session = await stripe.checkout.sessions.create({
        ui_mode: "embedded",
        line_items: [
          {
            price: product.default_price as string,
            quantity: 1,
          },
        ],
        mode: "subscription",
        return_url: returnUrl,
      })

      if (!session.client_secret) {
        console.error("Stripe subscription session creation failed", session)
        throw new Error("Error initiating Stripe subscription session")
      }

      return {
        clientSecret: session.client_secret,
        subscriptionId: session.subscription, // Assuming session.subscription exists
      }
    } else {
      // Create a session for a one-time payment
      const session = await stripe.checkout.sessions.create({
        ui_mode: "embedded",
        line_items: [
          {
            price: product.default_price as string,
            quantity: 1,
          },
        ],
        mode: "payment",
        return_url: returnUrl,
      })

      if (!session.client_secret) {
        console.error("Stripe payment session creation failed", session)
        throw new Error("Error initiating Stripe payment session")
      }

      return {
        clientSecret: session.client_secret,
        paymentIntentId: session.payment_intent, // Assuming session.payment_intent exists
      }
    }
  } catch (error) {
    console.error("Error creating Stripe session:", error)
    throw new Error("Error creating Stripe session")
  }
}
