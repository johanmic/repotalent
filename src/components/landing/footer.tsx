import { Icon } from "@/components/appIcon"
import Link from "next/link"
export function SiteFooter() {
  return (
    <footer className="border-grid border-t py-6 md:px-8 md:py-0">
      <div className="container-wrapper">
        <div className="container py-4">
          <div className="text-balance flex items-center justify-center text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with ❤️ in Stockholm, by Johan Mickelin{" "}
            <a
              href={"https://bsky.app/profile/jojomic.bsky.social"}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4 ml-2"
            >
              <Icon name="bluesky" />
            </a>
          </div>
          <div className="text-center text-xs leading-loose text-muted-foreground md:text-left flex items-center justify-center gap-2">
            <Link href="/legal/tos">Terms of Service</Link>
            <Link href="/legal/privacy">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
