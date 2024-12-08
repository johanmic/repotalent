import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

const LogoutPage = async () => {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}

export default LogoutPage
