import { MoveRight, PhoneCall, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CompareDemo } from "@/components/landing/compare"
import Link from "next/link"
export const Hero = () => (
  <div className="w-full py-10 lg:py-10 ">
    <div className="container mx-auto">
      <div className="grid grid-cols-1 gap-2 items-center lg:grid-cols-2">
        <div className="flex gap-4 flex-col">
          <div>
            <Badge>Beta Access</Badge>
          </div>
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-lg tracking-tighter text-left font-bold">
              Base your talent search directly from your codebase
            </h1>
            <p className="text-xl leading-relaxed tracking-tight text-muted-foreground max-w-md text-left">
              Generate precise job descriptions and discover leads directly from
              your GitHub repository. Simplify hiring with insights drawn from
              your projects
            </p>
          </div>
          <div className="flex flex-row gap-4">
            <Link href="#features">
              <Button size="lg" className="gap-4" variant="outline">
                Find out more <Info className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" className="gap-4">
                Sign up <MoveRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
        <CompareDemo />
      </div>
    </div>
  </div>
)
