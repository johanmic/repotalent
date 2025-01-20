import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { LandingBanner } from "@/components/landing/landingBanner"
export const TopMenu = ({
  promoRef,
}: {
  promoRef?: string | null | undefined
}) => (
  <div
    className={`flex justify-between items-center fixed left-0 right-0 z-[50] mx-4 md:mx-0`}
    style={{
      top: promoRef ? "40px" : "0px",
    }}
  >
    <div className="flex gap-4 justify-between items-center border max-w-5xl border-muted mx-auto w-full rounded-lg m-2 bg-white shadow-lg">
      <Logo size="md" className="p-2" />

      {/* Desktop Menu */}
      <div className="hidden md:flex gap-4 items-center mr-2">
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

      {/* Mobile Menu */}
      <Sheet>
        <SheetTrigger asChild className="md:hidden mr-2 z-[40]">
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right">
          <div className="flex flex-col gap-4 mt-8">
            <Link href="/jobs">
              <div className="font-normal text-black py-2">Job Board</div>
            </Link>
            <Link href="#pricing">
              <div className="font-normal text-black py-2">Pricing</div>
            </Link>
            <Link href="/login">
              <Button className="w-full">Login</Button>
            </Link>
          </div>
        </SheetContent>
      </Sheet>
      <LandingBanner promoRef={promoRef} />
    </div>
  </div>
)
