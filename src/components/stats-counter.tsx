"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useEffect } from "react"
import { NumberTicker, NumberTickerRef } from "./ui/number-ticker"

export const StatsCounter = ({ number }: { number: number }) => {
  const ref = useRef<HTMLDivElement>(null)
  const tickerRef = useRef<NumberTickerRef>(null)
  const inView = useInView(ref)

  useEffect(() => {
    if (inView) {
      tickerRef.current?.startAnimation()
    }
  }, [inView])
  return (
    <div className="flex flex-col items-center justify-center" ref={ref}>
      <NumberTicker
        ref={tickerRef}
        from={0}
        target={number}
        transition={{ duration: 1 }}
      />
    </div>
  )
}
