"use client"
import { Button } from "@/components/ui/button"
import AppIcon from "@/components/appIcon"
import { createClient } from "@/utils/supabase/client"
export default function OAuthLogin() {
  const supabase = createClient()
  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={async () => {
          await supabase.auth.signInWithOAuth({
            provider: "github",
            options: {
              redirectTo: `http://example.com/auth/callback`,
            },
          })
        }}
      >
        <AppIcon name="github" />
        Sign in with Github
      </Button>
    </div>
  )
}
