import { Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
interface BigFeatureProps {
  title: string
  subtitle: string
  image: string
  features: string[]
  badge?: string
  CTA?: string
  CTA_link?: string
}
export const BigFeature = ({
  title,
  subtitle,
  image,
  features,
  badge,
  CTA,
  CTA_link,
}: BigFeatureProps) => (
  <div className="w-full ">
    <div className="container mx-auto">
      <div className="relative p-[2px] rounded-lg bg-gradient-to-r from-primary via-purple-500 to-pink-500 animate-gradient-x">
        <div className="grid rounded-lg bg-background py-20 lg:py-40 p-8 grid-cols-1 gap-8 items-center lg:grid-cols-2">
          <div className="flex gap-10 flex-col">
            <div className="flex gap-4 flex-col">
              {badge && (
                <div>
                  <Badge variant="outline">{badge}</Badge>
                </div>
              )}
              <div className="flex gap-2 flex-col">
                <h2 className="text-3xl lg:text-5xl tracking-tighter max-w-xl text-left font-bold">
                  {title}
                </h2>
                <p className="text-lg leading-relaxed tracking-tight text-muted-foreground max-w-xl text-left">
                  {subtitle}
                </p>
              </div>
            </div>
            <div className="grid lg:pl-6 grid-cols-1 sm:grid-cols-3 items-start lg:grid-cols-1 gap-2">
              {features.map((feature, index) => (
                <div key={index} className="flex flex-row gap-6 items-start">
                  <Check className="w-4 h-4 mt-2 text-primary" />
                  <div className="flex flex-col gap-1">
                    <p>{feature}</p>
                  </div>
                </div>
              ))}
            </div>
            {CTA && CTA_link && (
              <div className="flex justify-start">
                <Button asChild>
                  <Link href={CTA_link}>
                    {CTA}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
          {image ? (
            <div className="border rounded-md drop-shadow-xl p-4 bg-white border-muted">
              <Image
                src={image}
                alt="feature"
                width={500}
                height={500}
                className="rounded-md w-full h-auto object-contain"
              />
            </div>
          ) : (
            <div className="bg-muted rounded-md w-full aspect-video h-full flex-1"></div>
          )}
        </div>
      </div>
    </div>
  </div>
)
