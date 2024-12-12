import prisma from "@/store/prisma"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { user, organization } from "@prisma/client"
export interface User extends user {
  organization: organization
  creditsInfo?: {
    creditsBought: number
    creditsUsed: number
    creditsAvailable: number
  }
}

const getAvailableTokens = async (
  userId: string
): Promise<{
  creditsBought: number
  creditsUsed: number
  creditsAvailable: number
}> => {
  const credits = await prisma.$transaction([
    prisma.creditPurchase.aggregate({
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
  const supabase = await createClient()
  const supUser = await supabase.auth.getUser()

  if (!supUser.data.user) {
    redirect("/login")
  }

  const creditsAvailable = await getAvailableTokens(supUser.data.user.id)

  const user = await prisma.user.findUnique({
    where: { id: supUser.data.user.id },
    include: { organization: true },
  })

  return { ...user, creditsInfo: creditsAvailable } as User
}

export const updateUser = async (
  userId: string,
  data: {
    name?: string
    avatar?: string
  }
): Promise<User> => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      avatar: data.avatar,
    },
  })
  return user as User
}
