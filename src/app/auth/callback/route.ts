import { NextResponse } from "next/server"
// The client you created from the Server-Side Auth instructions
import { registerGithubUser } from "@/app/actions/user"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")

  if (!code) {
    console.error("Authorization code is missing")
    return NextResponse.redirect(
      `${origin}/auth/auth-code-error?error=missing_code`
    )
  }

  const next = searchParams.get("next") ?? "/home"
  const supabase = await createClient()

  try {
    const results = await supabase.auth.exchangeCodeForSession(code)

    console.log("Exchange results:", {
      error: results.error,
      hasUser: !!results.data?.user,
      userData: results.data?.user,
    })

    if (results.error) {
      console.error("Auth exchange error:", results.error)
      return NextResponse.redirect(
        `${origin}/auth/auth-code-error?error=exchange_failed`
      )
    }

    const user = results.data.user
    if (!user) {
      console.error("No user data received")
      return NextResponse.redirect(
        `${origin}/auth/auth-code-error?error=no_user`
      )
    }

    await registerGithubUser(user)

    const forwardedHost = request.headers.get("x-forwarded-host")
    const isLocalEnv = process.env.NODE_ENV === "development"

    if (isLocalEnv) {
      return NextResponse.redirect(`${origin}${next}`)
    } else if (forwardedHost) {
      return NextResponse.redirect(`https://${forwardedHost}${next}`)
    }
    return NextResponse.redirect(`${origin}${next}`)
  } catch (error) {
    console.error("Callback error:", error)
    return NextResponse.redirect(
      `${origin}/auth/auth-code-error?error=unexpected`
    )
  }
}
