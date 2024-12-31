"use client"
import { Button } from "@/components/ui/button"
import AppIcon from "@/components/appIcon"
import { createClient } from "@/utils/supabase/client"

export default function OAuthLogin() {
  const supabase = createClient()
  const onGithubLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_URL}/auth/callback`,
        scopes: ["repo", "read:org", "read:user", "user:email"].join(" "),
      },
    })
  }
  return (
    <div className="flex flex-col gap-2">
      <Button onClick={onGithubLogin}>
        <AppIcon name="github" />
        Sign in with Github
      </Button>
    </div>
  )
}
