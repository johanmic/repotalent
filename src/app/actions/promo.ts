"use server"

import prisma from "@/store/prisma"
import { getUser } from "@/utils/supabase/server"
import { promoCode } from "@prisma/client"
import { revalidatePath } from "next/cache"

export const redeemPromoCode = async ({ code }: { code: string }) => {
  try {
    const { user } = await getUser()
    if (!user) {
      return { error: "Please sign in to redeem a promo code" }
    }

    const { valid, message, promoCode } = await validatePromoCode({ code })
    if (!valid) {
      return { error: message }
    }
    if (!promoCode) {
      return { error: "Invalid promo code" }
    }

    const purchase = await prisma.purchase.create({
      data: {
        user: { connect: { id: user.id } },
        stripePurchaseId: `promo-${promoCode.id}-${user.id}`,
        creditsBought: promoCode.credits,
        promoCode: { connect: { id: promoCode.id } },
      },
    })

    await prisma.promoCodeUsage.create({
      data: {
        user: { connect: { id: user.id } },
        promoCode: { connect: { id: promoCode.id } },
      },
    })

    revalidatePath("/home", "layout")
    return { success: true, purchase }
  } catch (error) {
    return {
      error:
        "Unable to redeem promo code at this time. Please try again later.",
    }
  }
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
  if (promoCode.limit && promoCode.promoCodeUsage.length >= promoCode.limit) {
    message = "promo code limit reached"
    return { valid, message }
  }
  valid = true
  message = "promo code is valid"
  return { valid, message, promoCode }
}
