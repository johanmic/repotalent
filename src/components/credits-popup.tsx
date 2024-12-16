"use client"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Icon } from "@components/icon"
import { useRouter } from "next/navigation"
export default function CreditsPopup({
  creditsAvailable,
}: {
  creditsAvailable: number
}) {
  const router = useRouter()
  return (
    <Dialog open={true} onOpenChange={() => router.push("/home")}>
      <DialogContent>
        <DialogTitle>You have no credits available</DialogTitle>
        <DialogDescription>
          You can purchase credits to post jobs
        </DialogDescription>
        <div className="flex flex-row gap-2">
          <Button variant="outline" asChild>
            <Link href="/home">
              <Icon name="moveLeft" /> Go Back
            </Link>
          </Button>
          <Button asChild>
            <Link href="/home/purchase">
              <Icon name="coins" /> Purchase Credits
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
