import { useEffect, useState } from "react"
import Icon from "./icon"
import { Button } from "./ui/button"

interface Step {
  title: string
  component: React.ReactNode
}
const StepperHeader = ({
  steps,
  activeStep,
}: {
  steps: Step[]
  activeStep: number
}) => {
  return (
    <div className="flex items-center justify-around w-full px-4 py-6">
      {steps.map((step, index) => (
        <div
          className={`flex items-center space-x-2 ${
            activeStep === index ? "opacity-100" : "opacity-20"
          }`}
          key={step.title}
        >
          <div
            className={`w-8 h-8 rounded-full text-xl bg-muted flex items-center justify-center font-bold  `}
          >
            {index + 1}
          </div>
          <div className="text-sm">{step.title}</div>
        </div>
      ))}
    </div>
  )
}
const Stepper = ({
  steps,
  onChangeStep,
  onDone,
}: {
  steps: Step[]
  onChangeStep: (step: number) => void
  onDone: () => void
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    onChangeStep(currentStep)
  }, [currentStep])

  return (
    <div className="w-full">
      <StepperHeader steps={steps} activeStep={currentStep} />

      <div className="relative mt-6">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className={`${currentStep === index ? "block" : "hidden"}`}
          >
            {step.component}
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-8">
        {currentStep > 0 && (
          <Button
            variant="outline"
            onClick={() => setCurrentStep(currentStep - 1)}
          >
            <Icon name="moveLeft" className="mr-2" /> Previous
          </Button>
        )}
        {currentStep === steps.length - 1 && (
          <Button
            className="ml-auto"
            onClick={() => {
              setIsLoading(true)
              onDone()
            }}
            disabled={isLoading}
          >
            Write job description{" "}
            <Icon name={isLoading ? "spinner" : "moveRight"} className="ml-2" />
          </Button>
        )}
        {currentStep < steps.length - 1 && (
          <Button
            className="ml-auto"
            onClick={() => setCurrentStep(currentStep + 1)}
          >
            Next <Icon name="moveRight" className="ml-2" />
          </Button>
        )}
      </div>
    </div>
  )
}

export default Stepper
