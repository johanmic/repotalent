"use server"
import { createClient } from "@/utils/supabase/server"
import cuid from "cuid"
const basePath = "images"
export const signImageUrl = async (): Promise<{
  signedUrl: string
  path: string
}> => {
  const filename = cuid()
  const supabase = await createClient()
  const user = await supabase.auth.getUser()
  if (!user) throw new Error("User not found")

  const { data, error } = await supabase.storage
    .from(basePath)
    .createSignedUploadUrl(filename)

  if (error) {
    console.error("Errorcreating signed upload URL:", error)
    throw error
  }

  if (!data) {
    console.error("Signed URL data is null")
    throw new Error("Failed to create signed upload URL")
  }

  return {
    signedUrl: data.signedUrl,
    path: `${basePath}/${filename}`,
  }
}
