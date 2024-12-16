// import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import Icon from "@/components/icon"
import Link from "next/link"
import { User } from "@actions/user"
import { Button } from "@/components/ui/button"

export const SidebarUser = async ({ user }: { user: User }) => {
  return (
    <div className="flex items-center justify-between gap-2 bg-muted p-2 rounded-md">
      <Link href="/home/profile" className="flex items-center gap-2">
        {/* <Avatar className="w-8 h-8 border-primary border">
          <AvatarImage src={user.avatar || ""} />
          <AvatarFallback>
            {user.name ? user.name.charAt(0) : "??"}
          </AvatarFallback>
        </Avatar> */}
        <p>{user.name}</p>
        <div className="flex items-center gap-2">
          <Icon name="coins" className="w-3 h-3" />
          <div className="text-sm font-bold">
            {user.creditsInfo?.creditsAvailable}
          </div>
        </div>
      </Link>

      <Button asChild>
        <Link href="/home/purchase" className="flex items-center gap-1">
          <Icon name="plus" className="w-3 h-3" />
          <span className="text-sm font-bold">buy tokens</span>
        </Link>
      </Button>
    </div>
  )
}
