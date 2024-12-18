import { MoveRight, PhoneCall, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CompareDemo } from "@/components/landing/compare"
export const Hero = () => (
  <div className="w-full py-10 lg:py-10 ">
    <div className="container mx-auto">
      <div className="grid grid-cols-1 gap-2 items-center lg:grid-cols-2">
        <div className="flex gap-4 flex-col">
          <div>
            <Badge>Live in beta</Badge>
          </div>
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-lg tracking-tighter text-left font-bold">
              Find Top Talent Straight from Your Codebase
            </h1>
            <p className="text-xl leading-relaxed tracking-tight text-muted-foreground max-w-md text-left">
              Generate precise job descriptions and discover leads directly from
              your GitHub repository. Simplify hiring with insights drawn from
              your projects
            </p>
          </div>
          <div className="flex flex-row gap-4">
            <Button size="lg" className="gap-4" variant="outline">
              Find out more <Info className="w-4 h-4" />
            </Button>
            <Button size="lg" className="gap-4">
              Sign up <MoveRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <CompareDemo />
      </div>
    </div>
  </div>
)
