import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/icon"
import AppIcon from "@/components/appIcon"
export const GithubAppButton = ({ installed }: { installed: boolean }) => {
  return (
    <Link href="https://github.com/apps/repotalent">
      <Button className="bg-green-700 text-white">
        {installed ? (
          <Icon name="check" className="w-4 h-4" />
        ) : (
          <AppIcon name="github" className="w-4 h-4" />
        )}
        {installed ? "Installed" : "Install"}
      </Button>
    </Link>
  )
}
