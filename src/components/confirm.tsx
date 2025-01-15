import Text from "@/components/text"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { experienceLevels, getSeniorityLabel } from "@/utils/seniorityMapper"
import type { JobPost } from "@actions/jobpost"
import { CheckIcon, PencilIcon } from "lucide-react"
import { useState, useEffect } from "react"
import { reCalculateTitleAndSeniority } from "@/app/actions/prompt"
import type { jobPostQuestion, jobPostRatings } from "@prisma/client"
const toneOptions = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "friendly", label: "Friendly" },
  { value: "formal", label: "Formal" },
]
import { Spinner } from "@/components/ui/spinner"

interface EditableFieldProps {
  value: string
  isEditing: boolean
  onToggleEdit: () => void
  onValueChange?: (value: string | number) => void
  options?: Array<{ value: number; label: string }>
}

const EditableField = ({
  value,
  isEditing,
  onToggleEdit,
  onValueChange,
  options,
}: EditableFieldProps) => {
  const currentValue = options
    ?.find((opt) => opt.label === value)
    ?.value.toString()

  if (!isEditing) {
    return (
      <div className="flex items-center w-full">
        <div className="flex-1 min-h-10 flex items-center">
          <span>{value}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onToggleEdit}>
          <PencilIcon className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center w-full">
      {options ? (
        <Select
          value={options.find((opt) => opt.label === value)?.value.toString()}
          onValueChange={(v) => {
            const numericValue = parseFloat(v)
            const selectedOption = options.find(
              (opt) => opt.value === numericValue
            )
            if (selectedOption) {
              onValueChange?.(numericValue)
            }
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          value={value}
          onChange={(e) => onValueChange?.(e.target.value)}
          className="w-full"
        />
      )}
      <Button variant="ghost" size="sm" onClick={onToggleEdit}>
        <CheckIcon className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default function Confirm({
  jobPost,
  setTone,
  setAdditionalInfo,
  questionResults,
  tone,
  setTitle,
  additionalInfo,
  sliderResults,
  setExperienceLevel,
  active,
}: {
  jobPost: JobPost
  tone: string
  additionalInfo: string
  questionResults: jobPostQuestion[]
  sliderResults: jobPostRatings[]
  setTone: (tone: string) => void
  setAdditionalInfo: (additionalInfo: string) => void
  setExperienceLevel: (experienceLevel: number) => void
  setTitle: (title: string) => void
  active: boolean
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingLevel, setIsEditingLevel] = useState(false)
  const [seniority, setSeniority] = useState(jobPost.seniority || 0.3)
  const [title, localsetTitle] = useState(jobPost.title || "")
  const [loading, setLoading] = useState(false)
  const getSuggestedTitle = async () => {
    setLoading(true)
    const { suggestedTitle, seniority } = await reCalculateTitleAndSeniority({
      jobPostId: jobPost.id,
      questions: questionResults,
      ratings: sliderResults,
    })
    setLoading(false)
    localsetTitle(suggestedTitle)
    setSeniority(seniority)
    // setTitle(results.title)
  }
  useEffect(() => {
    if (active) {
      getSuggestedTitle()
    }
  }, [active, questionResults, sliderResults])
  return (
    <div className="w-full">
      {jobPost && (
        <div className="space-y-6 w-full mx-auto">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Suggested Role Details</CardTitle>
              <CardDescription>
                Review and edit the job posting details
              </CardDescription>
            </CardHeader>
            <div className="p-6 space-y-4 relative">
              {loading && (
                <div className="absolute top-0 left-0 w-full h-full bg-black/70 flex text-white items-center justify-center">
                  Updating labels <Spinner className="h-4 w-4 text-white" />
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="flex items-center gap-2">
                    Suggested Title{" "}
                    <Text className="flex-0 text-xs text-rose-500">
                      (AI Suggested)
                    </Text>
                  </Label>
                  <EditableField
                    value={title || ""}
                    isEditing={isEditingTitle}
                    onToggleEdit={() => setIsEditingTitle(!isEditingTitle)}
                    onValueChange={(value) => {
                      localsetTitle(value.toString())
                      setTitle(value.toString())
                    }}
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    Experience Level
                    <Text className="flex-0 text-xs text-rose-500">
                      (AI Suggested)
                    </Text>
                  </Label>
                  <EditableField
                    value={getSeniorityLabel(seniority).key}
                    isEditing={isEditingLevel}
                    onToggleEdit={() => setIsEditingLevel(!isEditingLevel)}
                    options={experienceLevels}
                    onValueChange={(value) => {
                      const numericValue = parseFloat(value.toString())
                      setSeniority(numericValue)
                      setExperienceLevel(numericValue)
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>
          <div className="py-6 space-y-4">
            <div>
              <Label className="flex items-center gap-2">Tone of Voice</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  {toneOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="flex items-center gap-2">
                Additional Information
              </Label>
              <Input
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="Add any specific requirements or notes, leave blank if none"
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
