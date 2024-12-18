import LoginForm from "./loginForm"
import Logo from "@/components/logo"
import Page from "@/components/page"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import OAuthLogin from "./OAuthLogin"
import { Separator } from "@/components/ui/separator"
const sideImage =
  "https://images.unsplash.com/photo-1617609277590-ec2d145ca13b?q=80&w=2333&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
export default async function LoginPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  // if (user) {
  //   redirect("/home")
  // }
  return (
    <div className="flex flex-row ">
      <div className="hidden md:block md:w-1/2 h-screen">
        <img
          src={sideImage}
          alt="Side"
          className="object-cover h-full w-full bg-cover bg-center"
        />
      </div>
      <div className="flex flex-col items-center justify-center w-full md:w-1/2">
        <div className="flex flex-col items-center justify-center max-w-lg w-full">
          <Logo size="lg" className="-ml-4" />
          <Card className="p-4 w-full">
            <CardContent className="space-y-4">
              <OAuthLogin />
              <Separator />
              <LoginForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
