import prisma from "@/store/prisma"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { user, organization } from "@prisma/client"
interface User extends user {
  organization: organization
}
export const getUser = async (): Promise<User> => {
  const supabase = await createClient()
  const supUser = await supabase.auth.getUser()

  if (!supUser.data.user) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: supUser.data.user.id },
    include: { organization: true },
  })
  return user as User
}
