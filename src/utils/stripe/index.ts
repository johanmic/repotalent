"use server"
import { Stripe } from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

export const getStripeInstance = async () => {
  return stripe
}

export const getUserSubscription = async (stripeSubscriptionId: string) => {
  if (!stripeSubscriptionId) {
    throw new Error("User not found")
  }
  const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId)

  return subscription
}

export const cancelUserSubscription = async (stripeSubscriptionId: string) => {
  if (!stripeSubscriptionId) {
    throw new Error("User not found")
  }
  await stripe.subscriptions.cancel(stripeSubscriptionId)
}

export const createStripeCustomer = async (email: string) => {
  const customer = await stripe.customers.create({
    email,
  })

  return customer
}
