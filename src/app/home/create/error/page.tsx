import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default function ErrorPage() {
  return (
    <div className="h-screen w-full flex items-center justify-center">
      <Card className="w-[380px] shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Something went wrong</CardTitle>
          <CardDescription className="text-base">
            Your credit has been restored
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Link href="/home">
            <Button variant="default">Return Home</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
