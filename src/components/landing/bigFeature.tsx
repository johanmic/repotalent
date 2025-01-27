"use client"

import { Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"

interface BigFeatureProps {
  title: string
  subtitle: string
  image: string
  features: string[]
  badge?: string
  extra?: string | React.ReactNode
  CTA?: string
  CTA_link?: string
  reverse?: boolean
  animatedBoarder?: boolean
  intertedColors?: boolean
  className?: string
}

export const BigFeature = ({
  title,
  subtitle,
  image,
  features,
  badge,
  extra,
  CTA,
  CTA_link,
  reverse,
  animatedBoarder = true,
  intertedColors = false,
  className,
}: BigFeatureProps) => {
  const containerRef = useRef(null)
  const isInView = useInView(containerRef, { once: true, margin: "-100px" })

  const contentVariants = {
    hidden: { opacity: 0, x: reverse ? 50 : -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  }

  const imageVariants = {
    hidden: { opacity: 0, x: reverse ? -50 : 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: "easeOut", delay: 0.2 },
    },
  }

  return (
    <div className={`w-full ${className}`} ref={containerRef}>
      <div className="container mx-auto">
        <div
          className={`relative p-[2px] rounded-lg ${
            animatedBoarder
              ? "bg-gradient-to-r from-primary via-purple-500 to-pink-500 animate-gradient-x"
              : ""
          }`}
        >
          <div
            className={`grid rounded-lg ${
              intertedColors ? "bg-primary" : "bg-background"
            } py-20 lg:py-40 p-8 grid-cols-1 gap-8 items-center lg:grid-cols-2`}
          >
            <motion.div
              className={`flex gap-10 flex-col ${reverse ? "lg:order-2" : ""}`}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              variants={contentVariants}
            >
              <div className="flex gap-4 flex-col">
                {badge && (
                  <div>
                    <Badge
                      className={
                        intertedColors ? "bg-background text-primary" : ""
                      }
                    >
                      {badge}
                    </Badge>
                  </div>
                )}
                <div className="flex gap-2 flex-col">
                  <h2
                    className={`text-3xl lg:text-5xl tracking-tighter max-w-xl text-left font-bold ${
                      intertedColors ? "text-background" : ""
                    }`}
                  >
                    {title}
                  </h2>
                  <p
                    className={`text-lg leading-relaxed tracking-tight ${
                      intertedColors
                        ? "text-background/80"
                        : "text-muted-foreground"
                    } max-w-xl text-left`}
                  >
                    {subtitle}
                  </p>
                </div>
              </div>
              <div className="grid lg:pl-6 grid-cols-1 sm:grid-cols-3 items-start lg:grid-cols-1 gap-2">
                {features.map((feature, index) => (
                  <div key={index} className="flex flex-row gap-6 items-start">
                    <Check
                      className={`w-4 h-4 mt-2 ${
                        intertedColors ? "text-background" : "text-primary"
                      }`}
                    />
                    <div className="flex flex-col gap-1">
                      <p className={intertedColors ? "text-background" : ""}>
                        {feature}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {extra}
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
            </motion.div>
            <motion.div
              className={`${
                reverse ? "lg:order-1" : ""
              } border rounded-md drop-shadow-xl p-4 bg-white border-muted`}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              variants={imageVariants}
            >
              {image ? (
                <Image
                  src={image}
                  alt="feature"
                  width={500}
                  height={500}
                  className="rounded-md w-full h-auto object-contain"
                />
              ) : (
                <div className="bg-muted rounded-md w-full aspect-video h-full flex-1"></div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
