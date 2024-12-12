"use server"

import prisma from "@/store/prisma"
import { getUser } from "@/utils/supabase/server"

export const usePromoCode = async ({ code }: { code: string }) => {
  const { user } = await getUser()
  if (!user) {
    throw new Error("User not found")
  }

  const promoCode = await prisma.promoCode.findUniqueOrThrow({
    where: {
      code,
    },
  })

  if (promoCode.oneTime) {
    const promoCodeUsed = await prisma.promoCodeUsage.findFirst({
      where: {
        userId: user.id,
        promoCodeId: promoCode.id,
      },
    })
    if (promoCodeUsed) {
      throw new Error("promo code already used")
    }
  } else {
    const userHasUsedPromoCode = await prisma.promoCodeUsage.findFirst({
      where: {
        userId: user.id,
        promoCodeId: promoCode.id,
      },
    })
    if (userHasUsedPromoCode) {
      throw new Error("you already used this promo code")
    }
  }

  const creditPurchase = await prisma.creditPurchase.create({
    data: {
      user: {
        connect: {
          id: user.id,
        },
      },
      stripePurchaseId: `promo-${promoCode.id}-${user.id}`,
      creditsBought: promoCode.credits,
      promoCode: {
        connect: {
          id: promoCode.id,
        },
      },
    },
  })

  await prisma.promoCodeUsage.create({
    data: {
      user: {
        connect: {
          id: user.id,
        },
      },
      promoCode: {
        connect: {
          id: promoCode.id,
        },
      },
    },
  })
  return creditPurchase
}

export const validatePromoCode = async ({
  code,
}: {
  code: string
}): Promise<{ valid: boolean; message: string }> => {
  const { user } = await getUser()
  if (!user) {
    throw new Error("User not found")
  }
  let valid = false
  let message = ""
  const promoCode = await prisma.promoCode.findUnique({
    where: {
      code,
    },
    include: {
      creditPurchase: true,
      promoCodeUsage: true,
    },
  })
  if (!promoCode) {
    message = "promo code not found"
    return { valid, message }
  }
  if (promoCode.expiresAt && promoCode.expiresAt < new Date()) {
    message = "promo code expired"
    return { valid, message }
  }
  if (promoCode.oneTime && promoCode.creditPurchase.length > 0) {
    message = "promo code already used"
    return { valid, message }
  }
  if (promoCode.promoCodeUsage.find((cp) => cp.userId === user.id)) {
    message = "you have already used this promo code"
    return { valid, message }
  }
  valid = true
  message = "promo code is valid"
  return { valid, message }
}
