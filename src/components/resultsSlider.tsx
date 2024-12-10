"use client"

import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { jobPostRatings } from "@prisma/client"
import { is } from "ramda"
// interface Result {
//   id: string
//   question: string
//   rating: number
// }

const parseValue = (
  value: number
): {
  text: string
  emoji: string
  color: string
} => {
  switch (value) {
    case 0:
      return { text: "N/A", emoji: "🫥", color: "text-gray-500" }
    case 25:
      return { text: "Beginner", emoji: "🤪", color: "text-green-500" }
    case 50:
      return { text: "Intermediate", emoji: "🙂", color: "text-yellow-500" }
    case 75:
      return { text: "Advanced", emoji: "😎", color: "text-rose-500" }
    case 100:
      return { text: "Expert", emoji: "🤓", color: "text-blue-500" }
    default:
      return { text: "N/A", emoji: "😶‍🌫️", color: "text-gray-500" }
  }
}

const SliderStep = ({
  rating,
  handleValueChange,
  index,
}: {
  rating: jobPostRatings
  handleValueChange: (id: string, value: number) => void
  index: number
}) => {
  const [sliderValue, setSliderValue] = useState(
    is(Number, rating.rating) ? rating.rating : 50
  )
  const { text, emoji, color } = parseValue(sliderValue ?? 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      key={rating.id}
    >
      <Card className="w-full my-4">
        <CardHeader>
          <CardTitle className="text-sm italic">{rating.question}</CardTitle>
          <CardDescription>
            <div className="flex items-center gap-2">
              <Slider
                min={0}
                max={100}
                step={25}
                value={[sliderValue]}
                onValueChange={(value) => {
                  handleValueChange(rating.id, value[0] as number)
                  setSliderValue(value[0] as number)
                }}
                className={sliderValue === 75 ? "slider-rose" : ""}
              />
              <AnimatePresence mode="wait">
                <motion.div
                  key={sliderValue}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className={`text-md w-48 text-right flex items-center justify-end gap-2 ${color}`}
                >
                  {text}
                  <span className="text-4xl">{emoji}</span>
                </motion.div>
              </AnimatePresence>
            </div>
          </CardDescription>
        </CardHeader>
      </Card>
    </motion.div>
  )
}

const ResultsSlider = ({
  questions,
  onDone,
  activeStep,
}: {
  questions: jobPostRatings[]
  onDone: (results: jobPostRatings[]) => void
  activeStep: number
}) => {
  const [results, setResults] = useState<jobPostRatings[]>([])

  useEffect(() => {
    setResults(questions)
  }, [questions])

  function handleValueChange(id: string, value: number) {
    const newResults = results.map((rating) =>
      rating.id === id ? { ...rating, rating: value } : rating
    )
    setResults(newResults)
    onDone(newResults)
  }

  if (!questions || activeStep !== 0) return null

  return (
    <div className="my-8">
      <div className="text-bold text-lg">
        How much should the candidate know about:
      </div>
      {results.map((rating, index) => (
        <SliderStep
          key={rating.id}
          rating={rating}
          handleValueChange={handleValueChange}
          index={index}
        />
      ))}
    </div>
  )
}

export default ResultsSlider
