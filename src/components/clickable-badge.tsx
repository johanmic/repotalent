"use client"
import { Badge } from "@/components/ui/badge"
import { useCopyToClipboard, useWindowSize } from "@uidotdev/usehooks"
import { toast } from "sonner"
export const ClickableBadge = ({
  text,
  children,
}: {
  text: string
  children?: React.ReactNode
}) => {
  const [_, copyToClipboard] = useCopyToClipboard()
  const { width } = useWindowSize()
  return (
    <Badge
      onClick={() => {
        copyToClipboard(text)
        toast.success("Copied to clipboard", {
          duration: 1000,
          position: (width ?? 0) > 768 ? "top-right" : "bottom-center",
        })
      }}
    >
      {children}
    </Badge>
  )
}
