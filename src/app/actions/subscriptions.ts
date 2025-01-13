"use server"
import prisma from "@/store/prisma"
import type Stripe from "stripe"
import { getUser } from "@/utils/supabase/server"
import {
  getUserSubscription as getUserSubscriptionFromStripe,
  cancelUserSubscription as cancelUserSubscriptionFromStripe,
} from "@/utils/stripe"
import { subscription, product, purchase } from "@prisma/client"
import { revalidatePath } from "next/cache"
export interface Subscription extends subscription {
  product: product
  purchase?: purchase
}

export async function handleSubscriptionChange(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription
  const customerId = subscription.customer as string

  const user = await prisma.user.findFirst({
    where: {
      stripeCustomerId: customerId,
    },
  })

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
      await handleSubscriptionDeletion({ subscription })
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
  const recurring = lineItem.price.recurring?.interval as string

  const dbSub = await prisma.subscription.upsert({
    where: { userId },
    update: {
      stripeId: subscription.id,
      active: true,
      recurring,
      product: {
        connect: {
          id: product.id,
        },
      },
    },
    create: {
      stripeId: subscription.id,
      active: true,
      recurring,
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
}

export const handleSubscriptionDeletion = async ({
  subscription,
}: {
  subscription: Stripe.Subscription
}) => {
  await prisma.subscription.update({
    where: {
      id: subscription.id,
    },
    data: {
      active: false,
    },
  })
}
export interface Subscription extends Stripe.Subscription {
  plan: Stripe.Plan
}
export const getUserSubscription = async () => {
  const { user } = await getUser()
  if (!user) {
    throw new Error("User not found")
  }
  const subscription = await prisma.subscription.findFirst({
    where: { userId: user.id },
    include: {
      purchases: {
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

export const getUserSubscriptionFromDB = async () => {
  const { user } = await getUser()
  if (!user) {
    throw new Error("User not found")
  }
  const subscription = await prisma.subscription.findFirst({
    where: { userId: user.id },
    include: {
      purchases: {
        include: {
          product: true,
        },
      },
    },
  })
  return subscription
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
    revalidatePath("/home/profile", "page")
    return res
  }
}
