"use client"

import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export const CodeParserProgress = ({
  packages,
  filename,
}: {
  packages: { [key: string]: string }
  filename: string
}) => {
  const [progress, setProgress] = useState(0)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  const steps = [
    `Parsing ${filename}`,
    "Analyzing Packages",
    `Reading Metadata`,
    `Generating Job Description`,
    `Creating Questions`,
  ]

  const totalDuration = 30000 // 30 seconds
  //   const stepDuration = totalDuration / steps.length
  const progressPerStep = 100 / steps.length

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        const nextProgress = prevProgress + 1
        const currentStep = Math.floor(nextProgress / progressPerStep)

        if (currentStep !== currentStepIndex && !isComplete) {
          setCurrentStepIndex(currentStep)
        }

        if (nextProgress >= 100) {
          clearInterval(interval)
          setIsComplete(true)
          return 100
        }
        return nextProgress
      })
    }, totalDuration / 100) // Divide total duration by 100 steps

    return () => clearInterval(interval)
  }, [currentStepIndex, progressPerStep])

  return (
    <div className="w-full space-y-2">
      <Progress value={progress} className="w-full" />
      <AnimatePresence mode="wait">
        <motion.p
          key={isComplete ? "complete" : currentStepIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={!isComplete ? { opacity: 0, y: -20 } : undefined}
          transition={{ duration: 0.5 }}
          className="text-md text-muted-foreground"
        >
          {steps[currentStepIndex]}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
