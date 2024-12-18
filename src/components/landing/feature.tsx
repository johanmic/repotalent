"use client"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { motion, useInView } from "framer-motion"
import React from "react"
interface FeatureProps {
  title: string | React.ReactNode
  subtitle: string
  image: string
  badge?: string
  reverse?: boolean
}
export const Feature = ({
  title,
  subtitle,
  badge,
  image,
  reverse = false,
}: FeatureProps) => {
  const ref = React.useRef(null)
  const isInView = useInView(ref, {
    once: true,
    margin: "-200px",
  })

  return (
    <div className="w-full py-20 lg:py-40">
      <div className="container mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 40 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className={`flex flex-col lg:flex-row gap-10 lg:items-center ${
            reverse ? "lg:flex-row-reverse" : ""
          }`}
        >
          <div className="flex gap-4 flex-col md:w-1/2">
            <div className={`${reverse ? "lg:ml-auto" : ""}`}>
              <Badge>{badge}</Badge>
            </div>
            <div
              className={`flex gap-2 flex-col ${reverse ? "lg:items-end" : ""}`}
            >
              <h2
                className={`text-xl md:text-5xl tracking-tighter lg:max-w-xl font-bold ${
                  reverse ? "lg:text-right" : "text-left"
                }`}
              >
                {title}
              </h2>
              <p
                className={`text-lg max-w-xl lg:max-w-sm leading-relaxed tracking-tight text-muted-foreground ${
                  reverse ? "lg:text-right" : "text-left"
                }`}
              >
                {subtitle}
              </p>
            </div>
          </div>
          {image ? (
            <div className="md:w-1/2 border rounded-md drop-shadow-xl p-4 bg-white border-muted">
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
        </motion.div>
      </div>
    </div>
  )
}
