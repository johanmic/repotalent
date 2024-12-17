"use server"

import prisma from "@/store/prisma"
import { getUser } from "@/utils/supabase/server"
import { promoCode } from "@prisma/client"
export const usePromoCode = async ({ code }: { code: string }) => {
  const { user } = await getUser()
  if (!user) {
    throw new Error("User not found")
  }

  const { valid, message, promoCode } = await validatePromoCode({ code })
  if (!valid) {
    throw new Error(message)
  }
  if (!promoCode) {
    throw new Error("Promo code not found")
  }

  const purchase = await prisma.purchase.create({
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
  return purchase
}

export const validatePromoCode = async ({
  code,
}: {
  code: string
}): Promise<{
  valid: boolean
  message: string
  promoCode?: promoCode
}> => {
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
      purchase: true,
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
  if (promoCode.oneTime && promoCode.purchase.length > 0) {
    message = "promo code already used"
    return { valid, message }
  }
  if (promoCode.promoCodeUsage.find((cp) => cp.userId === user.id)) {
    message = "you have already used this promo code"
    return { valid, message }
  }
  valid = true
  message = "promo code is valid"
  return { valid, message, promoCode }
}
