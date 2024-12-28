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

export const parseValue = (
  value: number
): {
  text: string
  emoji: string
  color: string
} => {
  switch (value) {
    case 0:
      return { text: "N/A", emoji: "🫥", color: "text-gray-500" }
    case 25:
      return { text: "Beginner", emoji: "🤪", color: "text-green-500" }
    case 50:
      return { text: "Intermediate", emoji: "🙂", color: "text-yellow-500" }
    case 75:
      return { text: "Advanced", emoji: "😎", color: "text-rose-500" }
    case 100:
      return { text: "Expert", emoji: "🤓", color: "text-blue-500" }
    default:
      return { text: "N/A", emoji: "😶‍🌫️", color: "text-gray-500" }
  }
}
