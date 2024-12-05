import LoginForm from "./loginForm"
import Logo from "@/components/logo"
import Page from "@/components/page"
import { Card, CardContent, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  return (
    <Page>
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center justify-center w-full max-w-md">
          <Logo size="lg" />
          <Card className="p-4 w-full">
            <CardContent className="space-y-4">
              <CardTitle>Login</CardTitle>
              <LoginForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </Page>
  )
}
