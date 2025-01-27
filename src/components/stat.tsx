"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"

export const StatsCounter = ({
  title,
  number,
  subtitle,
  reverse = false,
  delay = 0,
}: {
  title: string
  number: number
  subtitle?: string
  reverse?: boolean
  delay?: number
}) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 10 }}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col items-center justify-center"
    >
      <p
        className={`text-sm font-primary opacity-50 ${
          reverse ? "text-white" : "text-primary"
        }`}
      >
        {title}
      </p>
      <p
        className={`text-2xl md:text-6xl font-bold font-primary ${
          reverse ? "text-white" : "text-primary"
        }`}
      >
        {number}
      </p>
      {subtitle && (
        <p
          className={`text-sm ${
            reverse ? "text-white" : "text-muted-foreground"
          } opacity-50`}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}
