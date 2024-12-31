import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
export const TopMenu = () => (
  <div className="flex justify-between items-center fixed top-0 left-0 right-0 z-10">
    <div className="flex gap-4 justify-between items-center border max-w-5xl border-muted mx-auto w-full rounded-lg m-2 bg-white shadow-lg">
      <Logo size="md" />
      <div className="flex gap-4 items-center mr-2">
        <Link href="/jobs">
          <div className="font-normal text-black">Job Board</div>
        </Link>
        <Separator orientation="vertical" />
        <Link href="#pricing">
          <div className="font-normal text-black">Pricing</div>
        </Link>
        <Separator orientation="vertical" />
        <Link href="/login">
          <Button>Login</Button>
        </Link>
      </div>
    </div>
  </div>
)
