"use server"

import prisma from "@/store/prisma"
import { getUser } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export const dbAddCredits = async ({
  productId,
  stripeId,
  userId,
  subscriptionId,
  idType,
  jobBoard = true,
}: {
  productId: string
  stripeId: string
  subscriptionId?: string
  userId: string
  idType: "invoiceId" | "purchaseId"
  jobBoard: boolean
}) => {
  const product = await prisma.product.findUniqueOrThrow({
    where: {
      stripeId: productId,
    },
  })

  const purchaseIDUsed = await prisma.purchase.count({
    where: {
      userId,
      stripePurchaseId: stripeId,
    },
  })
  if (purchaseIDUsed > 0) {
    return null
  }

  const purchase = await prisma.purchase.create({
    data: {
      user: {
        connect: {
          id: userId,
        },
      },
      stripePurchaseId: stripeId,
      idType,
      jobBoard,
      product: {
        connect: {
          id: product.id,
        },
      },
      creditsBought: product.credits,
      ...(subscriptionId && {
        subscription: {
          connect: {
            stripeId: subscriptionId,
          },
        },
      }),
    },
  })

  return purchase
}

export const addCredits = async ({
  productId,
  stripeId,
  idType,
  jobBoard = true,
}: {
  productId: string
  stripeId: string
  idType: "invoiceId" | "purchaseId"
  jobBoard: boolean
}) => {
  const { user } = await getUser()
  if (!user) {
    throw new Error("User not found")
  }

  const purchase = await dbAddCredits({
    productId,
    stripeId,
    userId: user.id,
    idType,
    jobBoard,
  })
  revalidatePath("/home", "layout")
  return purchase
}

export const getproduct = async (stripeProductId: string) => {
  return await prisma.product.findUniqueOrThrow({
    where: {
      stripeId: stripeProductId,
    },
  })
}

export const getPurchase = async (purchaseId: string) => {
  const { user } = await getUser()
  if (!user) {
    throw new Error("User not found")
  }
  return await prisma.purchase.findUnique({
    where: {
      id: purchaseId,
      userId: user.id,
    },
    include: {
      product: true,
      subscription: true,
    },
  })
}

export const getUserUsageStats = async () => {
  const { user } = await getUser()
  if (!user) {
    throw new Error("User not found")
  }
  const purchases = await prisma.purchase.findMany({
    where: { userId: user.id },
    include: {
      product: true,
      subscription: true,
      promoCode: true,
    },
  })
  const creditUsage = await prisma.creditUsage.findMany({
    where: { userId: user.id },
    include: {
      jobPost: true,
    },
  })

  return { purchases, creditUsage }
}
