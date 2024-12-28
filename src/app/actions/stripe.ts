"use server"

import { Stripe } from "stripe"
import prisma from "@/store/prisma"
const apiKey = process.env.STRIPE_SECRET_KEY as string
const stripe = new Stripe(apiKey)
import { getUser } from "@actions/user"
import { dbAddCredits } from "@actions/credits"
interface NewSessionOptions {
  productId: string
  isSubscription: boolean
}

export const postStripeSession = async ({ productId }: NewSessionOptions) => {
  try {
    const user = await getUser()
    let stripeCustomerId = user.stripeCustomerId
    if (!stripeCustomerId) {
      const stripeCustomer = await stripe.customers.create({
        email: user.email,
      })
      stripeCustomerId = stripeCustomer.id
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId },
      })
    }
    const returnUrl = `${process.env.NEXT_PUBLIC_URL}/home/checkout-return?session_id={CHECKOUT_SESSION_ID}`
    const stripeProduct = await stripe.products.retrieve(productId)

    if (!stripeProduct.default_price)
      throw new Error("Product has no default price")
    const price = await stripe.prices.retrieve(
      stripeProduct.default_price as string
    )

    const product = await prisma.product.findFirst({
      where: {
        stripeId: stripeProduct.id as string,
      },
    })
    if (!product) throw new Error("Credit package not found")
    if (price.recurring) {
      // Create a session for a subscription
      const session = await stripe.checkout.sessions.create({
        ui_mode: "embedded",
        customer: stripeCustomerId || undefined,
        line_items: [
          {
            price: stripeProduct.default_price as string,
            quantity: 1,
          },
        ],
        metadata: {
          productId,
        },
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
        customer: stripeCustomerId || undefined,
        line_items: [
          {
            price: stripeProduct.default_price as string,
            quantity: 1,
          },
        ],
        metadata: {
          productId,
        },
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

export const getCustomerSubscription = async () => {
  const user = await getUser()
  if (!user.stripeCustomerId) return null
  const subscriptions = await stripe.subscriptions.list({
    customer: user.stripeCustomerId,
  })
  return subscriptions
}

export const removeSubscription = async (subscriptionId: string) => {
  const subscription = await stripe.subscriptions.cancel(subscriptionId)
  return subscription
}

export const addSubscriptionCredits = async (event: Stripe.Event) => {
  const stripeInvoice = event.data.object as Stripe.Invoice
  const data = stripeInvoice.lines.data[0]
  const user = await prisma.user.findFirst({
    where: {
      stripeCustomerId: stripeInvoice.customer as string,
    },
  })
  if (!user) throw new Error("User not found")

  const productId = data.plan?.product as string
  const subscriptionId = data.subscription as string
  await dbAddCredits({
    productId,
    stripeId: stripeInvoice.id,
    subscriptionId,
    userId: user.id,
    idType: "invoiceId",
  })
}
