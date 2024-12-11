"use client"
import AppIconsList from "@/components/app-icons-list"
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
  const [experienceLevel, setExperienceLevel] = useState<number>(
    jobPost?.seniority || 0.5
  )

  console.log("experienceLevel", experienceLevel)
  const onDone = useCallback(() => {
    updateJobPost({
      jobId: jobPost.id,
      data: {
        ...jobPost,
        questions: questionResults,
        ratings: sliderResults,
        seniority: experienceLevel,
      },
    })
  }, [jobPost, questionResults, sliderResults, experienceLevel])

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
          setExperienceLevel={setExperienceLevel}
        />
      ),
    },
  ]

  return <Stepper steps={steps} onChangeStep={setActiveStep} onDone={onDone} />
}

const CompleteJobPost = ({ jobPost }: { jobPost: JobPost }) => {
  return (
    <div>
      <div className="space-y-6 flex flex-col h-full min-h-screen">
        <div className="flex items-center justify-center w-full">
          <h1 className="text-2xl font-bold">Complete your job post</h1>
        </div>

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
