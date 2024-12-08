"use client"

import UploadForm from "@/components/uploadForm"
import CodeParser from "@/components/codeParser"
import { prepareQuestions, PrepQuestionsResponse } from "@actions/prompt"
import { useState, useEffect, useCallback } from "react"
import AppIconsList from "@/components/appIconsList"
import ResultsSlider from "@/components/resultsSlider"
import Stepper from "@/components/stepper"
import Questions from "@/components/questions"
import Confirm from "@/components/confirm"
const PrepQuestionStepper = ({
  prepResults,
}: {
  prepResults: PrepQuestionsResponse
}) => {
  const [sliderResults, setSliderResults] = useState<
    {
      question: string
      value: number
    }[]
  >([])
  const [activeStep, setActiveStep] = useState(0)
  const [questionResults, setQuestionResults] = useState<
    { question: string; value: number }[]
  >([])

  const [tone, setTone] = useState<string>("")
  const [additionalInfo, setAdditionalInfo] = useState<string>("")

  const onDone = () => {
    console.log("done")
  }

  console.log("setQuestionResults", questionResults)

  const steps = [
    {
      title: "Review Results",
      component: (
        <ResultsSlider
          questions={prepResults?.packages}
          onDone={setSliderResults}
          activeStep={activeStep}
        />
      ),
    },
    {
      title: "Questions",
      component: (
        <Questions
          questions={prepResults?.questions}
          onDone={setQuestionResults}
          activeStep={activeStep}
        />
      ),
    },
    {
      title: "Confirm",
      component: (
        <Confirm
          response={prepResults}
          tone={tone}
          additionalInfo={additionalInfo}
          setTone={setTone}
          setAdditionalInfo={setAdditionalInfo}
        />
      ),
    },
  ]

  return <Stepper steps={steps} onChangeStep={setActiveStep} onDone={onDone} />
}
const NewPost = () => {
  const [showCodeParser, setShowCodeParser] = useState(false)
  const [fileData, setFileData] = useState<{
    filename: string
    data: string
  } | null>(null)
  const [prepResults, setPrepResults] = useState<PrepQuestionsResponse | null>(
    null
  )

  const prepQuestions = useCallback(
    async (data: { filename: string; data: string }) => {
      const results = await prepareQuestions(data)
      setPrepResults(results)
    },
    []
  )
  useEffect(() => {
    if (!fileData) return
    if (fileData?.filename && fileData?.data) {
      console.log(fileData)
      prepQuestions(fileData)
      setShowCodeParser(true)
    }
  }, [prepQuestions, fileData])

  useEffect(() => {
    if (prepResults && fileData) {
      setTimeout(() => {
        setShowCodeParser(false)
      }, 3000)
    }
  }, [prepResults, fileData])

  return (
    <div className="space-y-6 flex flex-col h-full min-h-screen">
      <h1 className="text-2xl font-bold">Create a new post</h1>
      {!fileData && <UploadForm onUpdate={setFileData} />}
      {showCodeParser && <CodeParser />}
      {!showCodeParser && prepResults && (
        <>
          <AppIconsList items={prepResults.tags} />
          <PrepQuestionStepper prepResults={prepResults} />
        </>
      )}
    </div>
  )
}

export default NewPost
