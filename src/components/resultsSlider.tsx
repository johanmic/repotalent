"use client"

import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

interface Result {
  question: string
  value: number
}

const parseValue = (
  value: number
): {
  text: string
  emoji: string
  color: string
} => {
  switch (value) {
    case 0:
      return { text: "N/A", emoji: "😶‍🌫️", color: "text-gray-500" }
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
  question,
  value,
  handleValueChange,
  index,
  results,
}: {
  question: string
  value: number
  handleValueChange: (question: string, value: number) => void
  index: number
  results: Result[]
}) => {
  const [sliderValue, setSliderValue] = useState(value)

  const getValueColor = (value: number): string => {
    switch (value) {
      case 75:
        return "text-rose-500"
      case 50:
        return "text-yellow-500"
      case 25:
        return "text-green-500"
      case 0:
        return "text-gray-500"
      default:
        return ""
    }
  }

  const { text, emoji, color } = parseValue(sliderValue)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      key={question}
      className="flex flex-col my-8 gap-2 bg-base-300"
    >
      <div className="text-sm italic">{question}</div>
      <div className="flex items-center gap-2">
        <Slider
          min={0}
          max={100}
          step={25}
          value={[sliderValue]}
          onValueChange={(value) => {
            handleValueChange(question, value[0] as number)
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
            className={`text-lg w-48 text-right flex items-center justify-end gap-2 ${color}`}
          >
            {text}
            <span className="text-4xl">{emoji}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

const ResultsSlider = ({
  questions,
  onDone,
  activeStep,
}: {
  questions: string[] | undefined
  onDone: (results: Result[]) => void
  activeStep: number
}) => {
  const defaultResults = questions?.map((question) => ({ question, value: 50 }))
  const [results, setResults] = useState<Result[]>(defaultResults || [])

  useEffect(() => {
    onDone(results)
  }, [results])

  if (!questions || activeStep !== 0) return null

  function handleValueChange(question: string, value: number) {
    console.log(question, value)
    setResults((prevResults) => {
      const updatedResults = prevResults.filter((r) => r.question !== question)
      const results = [...updatedResults, { question, value }]
      return results
    })
  }

  return (
    <div className="my-8">
      <div className="text-bold text-lg">
        How much should the candidate know about:
      </div>
      {questions.map((question, index) => (
        <SliderStep
          key={question}
          question={question}
          results={results}
          value={results.find((r) => r.question === question)?.value || 50}
          handleValueChange={handleValueChange}
          index={index}
        />
      ))}
    </div>
  )
}

export default ResultsSlider
