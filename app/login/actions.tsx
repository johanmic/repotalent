"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/utils/supabase/server"

export async function login(formData: FormData) {
  console.log("OTP start")
  const supabase = await createClient()

  const email = formData.get("email") as string

  // Request OTP for the email
  const { data, error } = await supabase.auth.signInWithOtp({ email })
  console.log({ data, error })
  if (error) {
    redirect("/error")
  }
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

  if (error) {
    redirect("/error")
  }

  revalidatePath("/new", "layout")
  redirect("/new")
}
