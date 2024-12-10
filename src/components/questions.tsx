import { useState, useEffect, useCallback } from "react"
import { Button } from "./ui/button"
import { motion } from "framer-motion"
import { Card, CardHeader, CardTitle, CardDescription } from "./ui/card"
import type { jobPostQuestion } from "@prisma/client"
const Question = ({
  question,
  onDone,
  index,
}: {
  question: jobPostQuestion
  onDone: (value: number) => void
  index: number
}) => {
  const [value, setValue] = useState<number | null>(() =>
    question.answer ? Number(question.answer) : null
  )
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
      className="my-4 max-w-2xl mx-auto"
    >
      <Card className="w-full">
        <CardHeader className="flex flex-col md:flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex-1">
            {/* <CardTitle className="text-lg font-semibold mb-2">
              #{index + 1}
            </CardTitle> */}
            <CardDescription className="text-base text-foreground">
              {question.question}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2 py-4 md:py-0">
            <Button
              size="sm"
              variant={value === 1 ? "default" : "outline"}
              onClick={() => setValue(1)}
              className={
                value === 1 ? "bg-rose-500 hover:bg-rose-600 text-white" : ""
              }
            >
              Yes
            </Button>
            <Button
              size="sm"
              variant={value === 0 ? "default" : "outline"}
              onClick={() => setValue(0)}
              className={
                value === 0 ? "bg-rose-500 hover:bg-rose-600 text-white" : ""
              }
            >
              No
            </Button>
            <Button
              size="sm"
              variant={value === 0.5 ? "default" : "outline"}
              onClick={() => setValue(0.5)}
              className={
                value === 0.5 ? "bg-rose-500 hover:bg-rose-600 text-white" : ""
              }
            >
              Maybe
            </Button>
          </div>
        </CardHeader>
      </Card>
    </motion.div>
  )
}
const Questions = ({
  questions,
  onDone,
  activeStep,
}: {
  questions: jobPostQuestion[]
  onDone: (results: jobPostQuestion[]) => void
  activeStep: number
}) => {
  const [answers, setAnswers] = useState<jobPostQuestion[]>(() =>
    questions.map((q) => ({
      ...q,
      answer: q.answer || null, // Preserve existing answers or set to null
    }))
  )
  useEffect(() => {
    onDone(answers)
  }, [answers])

  const onAnswer = useCallback(
    (value: number, index: number) => {
      setAnswers((prev) => {
        const updatedAnswers = [...prev]
        updatedAnswers[index] = {
          ...questions[index],
          answer: value.toString(),
        }
        return updatedAnswers
      })
    },
    [questions]
  )
  if (activeStep !== 1) {
    return null
  }
  return (
    <div className="m-4 md:m-0">
      {questions.map((question, index) => (
        <Question
          key={question.id}
          question={question}
          onDone={(value) => onAnswer(value, index)}
          index={index}
        />
      ))}
    </div>
  )
}

export default Questions
