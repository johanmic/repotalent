"use client"
import AppIconsList from "@/components/appIconsList"
import Confirm from "@/components/confirm"
import Questions from "@/components/questions"
import ResultsSlider from "@/components/resultsSlider"
import Stepper from "@/components/stepper"
import { JobPost, updateJobPost } from "@actions/jobpost"
import type { jobPostQuestion, jobPostRatings } from "@prisma/client"
import { useCallback, useState } from "react"
const PrepQuestionStepper = ({ jobPost }: { jobPost: JobPost }) => {
  const [sliderResults, setSliderResults] = useState<jobPostRatings[]>(
    jobPost?.ratings || []
  )
  const [activeStep, setActiveStep] = useState(0)

  const [questionResults, setQuestionResults] = useState<jobPostQuestion[]>(
    jobPost?.questions || []
  )

  const [tone, setTone] = useState<string>("")
  const [additionalInfo, setAdditionalInfo] = useState<string>("")

  const onDone = useCallback(() => {
    updateJobPost({
      jobId: jobPost.id,
      data: {
        ...jobPost,
        questions: questionResults,
        ratings: sliderResults,
      },
    })
  }, [jobPost, questionResults, sliderResults])

  console.log("setQuestionResults", questionResults)

  const steps = [
    {
      title: "Review Results",
      component: (
        <ResultsSlider
          questions={sliderResults}
          onDone={setSliderResults}
          activeStep={activeStep}
        />
      ),
    },
    {
      title: "Questions",
      component: (
        <Questions
          questions={questionResults}
          onDone={setQuestionResults}
          activeStep={activeStep}
        />
      ),
    },
    {
      title: "Confirm",
      component: (
        <Confirm
          jobPost={jobPost}
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

const CompleteJobPost = ({ jobPost }: { jobPost: JobPost }) => {
  return (
    <div>
      return (
      <div className="space-y-6 flex flex-col h-full min-h-screen">
        <h1 className="text-2xl font-bold">Create a new post</h1>

        <div className="flex flex-col gap-4 max-w-2xl mx-auto w-full">
          <AppIconsList
            items={jobPost?.tags?.map((tag) => tag.tag.tag) || []}
          />
          <PrepQuestionStepper jobPost={jobPost} />
        </div>
      </div>
      )
    </div>
  )
}

export default CompleteJobPost
