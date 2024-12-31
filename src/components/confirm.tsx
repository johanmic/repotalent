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
import { useState } from "react"

const toneOptions = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "friendly", label: "Friendly" },
  { value: "formal", label: "Formal" },
]

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
  tone,
  additionalInfo,
  setExperienceLevel,
}: {
  jobPost: JobPost
  tone: string
  additionalInfo: string
  setTone: (tone: string) => void
  setAdditionalInfo: (additionalInfo: string) => void
  setExperienceLevel: (experienceLevel: number) => void
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingLevel, setIsEditingLevel] = useState(false)
  const [seniority, setSeniority] = useState(jobPost.seniority || 0.3)
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
            <div className="p-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="flex items-center gap-2">
                    Suggested Title{" "}
                    <Text className="flex-0 text-xs text-rose-500">
                      (AI Suggested)
                    </Text>
                  </Label>
                  <EditableField
                    value={jobPost.title || ""}
                    isEditing={isEditingTitle}
                    onToggleEdit={() => setIsEditingTitle(!isEditingTitle)}
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
