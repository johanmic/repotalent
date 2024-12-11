import LoginForm from "./loginForm"
import Logo from "@/components/logo"
import Page from "@/components/page"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function LoginPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  // if (user) {
  //   redirect("/home")
  // }
  return (
    <Page>
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center justify-center w-full max-w-md">
          <Logo size="lg" className="-ml-4" />
          <Card className="p-4 w-full">
            <CardContent className="space-y-4">
              <LoginForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </Page>
  )
}
