import { useState, useEffect, useCallback } from "react"
import { Button } from "./ui/button"
import { motion } from "framer-motion"
import Icon from "./icon"
const Question = ({
  question,
  onDone,
  index,
}: {
  question: string
  onDone: (value: number) => void
  index: number
}) => {
  const [value, setValue] = useState<number | null>(null)
  useEffect(() => {
    if (value !== null) {
      onDone(value)
    }
  }, [value])
  return (
    <motion.div
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -50, opacity: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="flex items-center justify-between my-4"
    >
      <div>{question}</div>
      <div className="flex items-center space-x-2">
        <Button
          size="sm"
          variant={value === 1 ? "default" : "outline"}
          onClick={() => setValue(1)}
          className={value === 1 ? "bg-rose-500 text-white" : ""}
        >
          Yes
        </Button>
        <Button
          size="sm"
          variant={value === 0 ? "default" : "outline"}
          onClick={() => setValue(0)}
          className={value === 0 ? "bg-rose-500 text-white" : ""}
        >
          No
        </Button>
        <Button
          size="sm"
          variant={value === 0.5 ? "default" : "outline"}
          onClick={() => setValue(0.5)}
          className={value === 0.5 ? "bg-rose-500 text-white" : ""}
        >
          Maybe
        </Button>
      </div>
    </motion.div>
  )
}
const Questions = ({
  questions,
  onDone,
  activeStep,
}: {
  questions: string[]
  onDone: (results: { question: string; value: number }[]) => void
  activeStep: number
}) => {
  const [answers, setAnswers] = useState<{ question: string; value: number }[]>(
    []
  )
  useEffect(() => {
    console.log("answersanswers", JSON.stringify(answers, null, 2))
    onDone(answers)
  }, [answers])

  const onAnswer = useCallback(
    (value: number, index: number) => {
      setAnswers((prev) => {
        const updatedAnswers = [...prev, { question: questions[index], value }]
        return updatedAnswers
      })
    },
    [questions]
  )
  if (activeStep !== 1) {
    return null
  }
  return (
    <div>
      {questions.map((question, index) => (
        <Question
          key={question}
          question={question}
          onDone={(value) => onAnswer(value, index)}
          index={index}
        />
      ))}
    </div>
  )
}

export default Questions
