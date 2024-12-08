import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"
import { PrepQuestionsResponse } from "@/app/actions/prompt"
import { Button } from "@/components/ui/button"
import { PencilIcon, CheckIcon } from "lucide-react"
import Text from "@/components/text"
import { Label } from "@/components/ui/label"
const toneOptions = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "friendly", label: "Friendly" },
  { value: "formal", label: "Formal" },
]

const experienceLevels = [
  { value: 0.3, label: "Junior (1-2 years)" },
  { value: 0.6, label: "Mid-level (3-5 years)" },
  { value: 0.8, label: "Senior (6-8 years)" },
  { value: 1, label: "Lead (8+ years)" },
]

const getSeniorityLabel = (seniority: number): string => {
  if (seniority <= 0.3) return "Junior (1-2 years)"
  if (seniority <= 0.6) return "Mid-level (3-5 years)"
  if (seniority <= 0.8) return "Senior (6-8 years)"
  if (seniority <= 1) return "Lead (8+ years)"
  return "Lead (8+ years)"
}

interface EditableFieldProps {
  value: string
  isEditing: boolean
  onToggleEdit: () => void
  onValueChange?: (value: string) => void
  options?: Array<{ value: string | number; label: string }>
}

const EditableField = ({
  value,
  isEditing,
  onToggleEdit,
  onValueChange,
  options,
}: EditableFieldProps) => {
  if (!isEditing) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <span className="flex-1">{value}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onToggleEdit}>
          <PencilIcon className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return options ? (
    <Select value={value} onValueChange={(v) => onValueChange?.(v)}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.label}>
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
  )
}

export default function Confirm({
  response,
  setTone,
  setAdditionalInfo,
  tone,
  additionalInfo,
}: {
  response: PrepQuestionsResponse
  tone: string
  additionalInfo: string
  setTone: (tone: string) => void
  setAdditionalInfo: (additionalInfo: string) => void
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingLevel, setIsEditingLevel] = useState(false)

  return (
    <div className="space-y-6">
      {response && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="flex items-center gap-2">
                Suggested Title{" "}
                <Text className="flex-0 text-xs text-rose-500">
                  (AI Suggested)
                </Text>
              </Label>
              <EditableField
                value={response.suggestedTitle}
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
                value={getSeniorityLabel(response.seniority)}
                isEditing={isEditingLevel}
                onToggleEdit={() => setIsEditingLevel(!isEditingLevel)}
                options={experienceLevels}
              />
            </div>
          </div>

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
              placeholder="Add any specific requirements or notes"
              className="w-full"
            />
          </div>

          {/* ... rest of the existing response display ... */}
        </div>
      )}
    </div>
  )
}
