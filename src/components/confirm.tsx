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
  return (
    <div className="space-y-6">
      {response && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Suggested Title</label>
              <Input
                value={response.suggestedTitle}
                readOnly
                className="w-full"
              />
            </div>

            <div>
              <label className="label">Experience Level</label>
              <Select
                value={getSeniorityLabel(response.seniority)}
                onValueChange={(value) => {
                  // If you need to handle selection changes, add handler here
                  console.log(value)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  {experienceLevels.map((level) => (
                    <SelectItem key={level.value} value={level.label}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="label">Tone of Voice</label>
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
            <label className="label">Additional Information</label>
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
