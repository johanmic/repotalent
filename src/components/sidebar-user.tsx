import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import Icon from "@/components/icon"
import Link from "next/link"
import { User } from "@actions/user"
export const SidebarUser = async ({ user }: { user: User }) => {
  return (
    <Link
      href="/home/profile"
      className="flex items-center gap-2 bg-muted p-2 rounded-md"
    >
      <Avatar className="w-8 h-8 border-primary border">
        <AvatarImage src={user.avatar || ""} />
        <AvatarFallback>
          {user.name ? user.name.charAt(0) : "??"}
        </AvatarFallback>
      </Avatar>
      <p>{user.name}</p>
      <div className="flex items-center gap-2">
        <Icon name="coins" className="w-3 h-3" /> tokens{" "}
        <div className="text-sm font-bold">
          {user.creditsInfo?.creditsAvailable}
        </div>
      </div>
    </Link>
  )
}
