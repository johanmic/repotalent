import { NextResponse } from "next/server"
// The client you created from the Server-Side Auth instructions
import { registerGithubUser } from "@/app/actions/user"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)

  // Log all search parameters
  searchParams.forEach((value, key) => {})

  const code = searchParams.get("code")
  if (!code) {
    console.error("Authorization code is missing")
    return NextResponse.redirect(
      `${origin}/auth/auth-code-error?error=missing_code`
    )
  }

  const next = searchParams.get("next") ?? "/home"

  if (code) {
    const supabase = await createClient()
    const results = await supabase.auth.exchangeCodeForSession(code)

    //

    if (!results.error) {
      const forwardedHost = request.headers.get("x-forwarded-host")
      const isLocalEnv = process.env.NODE_ENV === "development"
      const user = results.data.user
      await registerGithubUser()
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
