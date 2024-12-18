"use client"

import { useState, useEffect } from "react"

interface TypewriterProps {
  words: string[]
  speed?: number
  deleteSpeed?: number
  pauseTime?: number
}

export const Typewriter = ({
  words,
  speed = 100,
  deleteSpeed = 50,
  pauseTime = 1500,
}: TypewriterProps) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentText, setCurrentText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    const word = words[currentWordIndex]

    const timeout = setTimeout(
      () => {
        // Deleting phase
        if (isDeleting) {
          if (currentText === "") {
            setIsDeleting(false)
            setCurrentWordIndex((prev) => (prev + 1) % words.length)
            return
          }
          setCurrentText((prev) => prev.slice(0, -1))
          return
        }

        // Pausing phase
        if (currentText === word && !isPaused) {
          setIsPaused(true)
          setTimeout(() => {
            setIsPaused(false)
            setIsDeleting(true)
          }, pauseTime)
          return
        }

        // Typing phase
        if (!isPaused && currentText !== word) {
          setCurrentText((prev) => word.slice(0, prev.length + 1))
        }
      },
      isDeleting ? deleteSpeed : speed
    )

    return () => clearTimeout(timeout)
  }, [
    currentText,
    currentWordIndex,
    isDeleting,
    isPaused,
    words,
    speed,
    deleteSpeed,
    pauseTime,
  ])

  return (
    <span className="inline-block">
      {currentText}
      <span className="animate-caret-blink">|</span>
    </span>
  )
}
