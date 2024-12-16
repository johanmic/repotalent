"use server"
import prisma from "@/store/prisma"
import { redirect } from "next/navigation"
import { user, organization } from "@prisma/client"
import { getUser as getUserFromSupabase } from "@/utils/supabase/server"
export interface User extends user {
  organization: organization
  creditsInfo?: {
    creditsBought: number
    creditsUsed: number
    creditsAvailable: number
  }
}

export const getAvailableTokens = async (
  userId: string
): Promise<{
  creditsBought: number
  creditsUsed: number
  creditsAvailable: number
}> => {
  const credits = await prisma.$transaction([
    prisma.purchase.aggregate({
      where: { userId },
      _sum: { creditsBought: true },
    }),
    prisma.creditUsage.aggregate({
      where: { userId },
      _sum: { creditsUsed: true },
    }),
  ])

  const totalBought = credits[0]._sum.creditsBought || 0
  const totalUsed = credits[1]._sum.creditsUsed || 0

  return {
    creditsBought: totalBought,
    creditsUsed: totalUsed,
    creditsAvailable: totalBought - totalUsed,
  }
}

export const getUser = async (): Promise<User> => {
  const { user } = await getUserFromSupabase()
  if (!user) {
    redirect("/login")
  }

  const creditsAvailable = await getAvailableTokens(user.id)

  const results = await prisma.user.findUnique({
    where: { id: user.id },
    include: { organization: true },
  })

  return { ...results, creditsInfo: creditsAvailable } as User
}

export const updateUser = async (
  id: string,
  data: {
    name?: string
    avatar?: string
    bio?: string | null
  }
): Promise<User> => {
  const { user } = await getUserFromSupabase()
  if (!user) {
    throw new Error("User not found")
  }
  const results = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: data.name,
      avatar: data.avatar,
      bio: data.bio || null,
    },
  })
  return results as User
}

export const setStripeCustomerId = async (stripeCustomerId: string) => {
  const user = await getUser()
  if (user.stripeCustomerId) {
    return
  }
  if (!user) {
    throw new Error("User not found")
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { stripeCustomerId },
  })
}
