"use server"

import prisma from "@/store/prisma"
import { getUser } from "@/utils/supabase/server"

export const addCredits = async ({
  stripePurchaseId,
}: {
  stripePurchaseId: string
}) => {
  const { user } = await getUser()
  if (!user) {
    throw new Error("User not found")
  }

  const creditPackage = await prisma.creditPackage.findUniqueOrThrow({
    where: {
      stripeId: stripePurchaseId,
    },
  })

  const creditPurchase = await prisma.creditPurchase.create({
    data: {
      user: {
        connect: {
          id: user.id,
        },
      },
      stripePurchaseId,
      creditPackage: {
        connect: {
          id: creditPackage.id,
        },
      },
      creditsBought: creditPackage.credits,
    },
  })

  return creditPurchase
}
