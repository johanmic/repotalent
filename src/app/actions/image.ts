"use server"
import { createClient } from "@/utils/supabase/server"
import cuid from "cuid"
const basePath = "images"
export const signImageUrl = async ({
  mimeType,
}: {
  mimeType: string
}): Promise<{
  signedUrl: string
  path: string
}> => {
  const filename = `${cuid()}.${mimeType.split("/")[1]}`
  const supabase = await createClient()
  const user = await supabase.auth.getUser()
  if (!user) throw new Error("User not found")

  const { data, error } = await supabase.storage
    .from(basePath)
    .createSignedUploadUrl(filename)

  if (error) {
    console.error("Error creating signed upload URL:", error)
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
