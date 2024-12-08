"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import prisma from "@/store/prisma"
import { createClient } from "@/utils/supabase/server"

export async function login(formData: FormData) {
  console.log("OTP start")
  const supabase = await createClient()

  const email = formData.get("email") as string

  // Request OTP for the email
  const { data, error } = await supabase.auth.signInWithOtp({ email })
  console.log({ data, error })

  return { error }
}

export const verifyOTP = async (formData: FormData) => {
  const supabase = await createClient()
  const email = formData.get("email") as string
  const otp = formData.get("otp") as string
  const { error } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: "email", // or 'sms', depending on your OTP type
  })
  const supUser = await supabase.auth.getUser()
  await prisma.user.upsert({
    where: { email },
    update: { email, id: supUser.data.user?.id, updatedAt: new Date() },
    create: { email, id: supUser.data.user?.id },
  })

  if (error) {
    redirect("/error")
  }

  revalidatePath("/home", "layout")
  redirect("/home")
}
