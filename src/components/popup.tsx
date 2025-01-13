"use client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Icon } from "@components/icon"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { icons } from "@/components/icon"
interface PopupProps {
  title: string
  text: string
  actions?: Array<{ label: string; href: string; icon?: string }>
}

export function Popup({ title, text, actions }: PopupProps) {
  const router = useRouter()
  const defaultAction = () => router.push("/home")

  return (
    <Dialog open={true} onOpenChange={defaultAction}>
      <DialogContent>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{text}</DialogDescription>
        <div className="flex flex-row gap-2">
          {actions?.length ? (
            actions.map((action, index) => (
              <Button key={index} asChild>
                <Link href={action.href}>
                  {action.icon && (
                    <Icon name={action.icon as keyof typeof icons} />
                  )}{" "}
                  {action.label}
                </Link>
              </Button>
            ))
          ) : (
            <Button variant="outline" onClick={defaultAction}>
              <Icon name="moveLeft" /> Go Back
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
