"use server"
import prisma from "@/store/prisma"
import type Stripe from "stripe"
import { getUser } from "@/utils/supabase/server"
import {
  getUserSubscription as getUserSubscriptionFromStripe,
  cancelUserSubscription as cancelUserSubscriptionFromStripe,
} from "@/utils/stripe"
import { subscription, product, creditPurchase } from "@prisma/client"

export interface Subscription extends subscription {
  product: product
  creditPurchase?: creditPurchase
}

export async function handleSubscriptionChange(event: Stripe.Event) {
  console.log("handleSubscriptionChange", event.data.object)

  const subscription = event.data.object as Stripe.Subscription
  const customerId = subscription.customer as string

  const user = await prisma.user.findFirst({
    where: {
      stripeCustomerId: customerId,
    },
  })

  console.log("user", user)

  if (!user) {
    throw new Error("User not found")
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
      // TODO: handle subscription purchase
      await handleSubscriptionPurchase({ subscription, userId: user.id })
      break
    case "customer.subscription.deleted":
      await handleSubscriptionDeletion({ subscription, userId: user.id })
      break
  }
}

const handleSubscriptionPurchase = async ({
  subscription,
  userId,
}: {
  subscription: Stripe.Subscription
  userId: string
}) => {
  console.log("handleSubscriptionPurchase", subscription, userId)

  const lineItem = subscription.items.data[0]
  const productId = lineItem.price.product as string
  const product = await prisma.product.findFirst({
    where: {
      stripeId: productId,
    },
  })
  if (!product) {
    throw new Error("Credit package not found")
  }

  console.log("product", product, lineItem, productId)

  const dbSub = await prisma.subscription.create({
    data: {
      stripeId: subscription.id,
      active: true,
      recurring: lineItem.price.recurring?.interval as string,
      product: {
        connect: {
          id: product.id,
        },
      },
      user: {
        connect: {
          id: userId,
        },
      },
    },
  })
  console.log("dbSub", dbSub)
}

export const handleSubscriptionDeletion = async ({
  subscription,
  userId,
}: {
  subscription: Stripe.Subscription
  userId: string
}) => {
  console.log("handleSubscriptionDeletion", subscription, userId)
  await prisma.subscription.update({
    where: {
      id: subscription.id,
    },
    data: {
      active: false,
    },
  })
}

export const getUserSubscription = async () => {
  const { user } = await getUser()
  if (!user) {
    throw new Error("User not found")
  }
  const subscription = await prisma.subscription.findFirst({
    where: { userId: user.id, active: true },
    include: {
      creditPurchase: {
        include: {
          product: true,
        },
      },
    },
  })
  if (subscription) {
    return getUserSubscriptionFromStripe(subscription.stripeId)
  }
}

export const cancelUserSubscription = async (stripeSubscriptionId: string) => {
  const { user } = await getUser()
  if (!user) {
    throw new Error("User not found")
  }
  const subscription = await prisma.subscription.findFirst({
    where: { stripeId: stripeSubscriptionId },
  })
  if (!subscription) {
    throw new Error("Subscription not found")
  }
  if (subscription) {
    await cancelUserSubscriptionFromStripe(stripeSubscriptionId)
    const res = await prisma.subscription.update({
      where: { id: subscription.id },
      data: { active: false },
    })
    return res
  }
}
