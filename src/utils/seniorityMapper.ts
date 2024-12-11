export const experienceLevels = [
  { value: 0.3, label: "Junior (1-2 years)" },
  { value: 0.6, label: "Mid-level (3-5 years)" },
  { value: 0.8, label: "Senior (6-8 years)" },
  { value: 1, label: "Lead (8+ years)" },
]

export const getSeniorityLabel = (
  seniority?: number
): { key: string; value: number } => {
  if (!seniority) return { key: "n/a", value: 0 }
  const level =
    experienceLevels.find((level) => level.value === seniority) ||
    experienceLevels[0]
  return { key: level.label, value: level.value }
}
