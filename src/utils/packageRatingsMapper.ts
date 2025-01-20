export const getRatingLabel = (rating: number) => {
  if (rating === 0)
    return {
      text: "Exclude from job description",
      color: "text-gray-400",
    }
  if (rating < 5)
    return {
      text: "Not relevant enough to mention",
      color: "text-gray-500",
    }
  if (rating >= 5 && rating <= 6)
    return {
      text: "Optional skill to mention",
      color: "text-blue-500",
    }
  if (rating >= 7 && rating <= 9)
    return {
      text: "Important required skill",
      color: "text-green-600",
    }
  if (rating === 10)
    return {
      text: "Critical required skill",
      color: "text-amber-600 font-semibold",
    }
  return {
    text: `Importance level: ${rating}`,
    color: "text-blue-600",
  }
}
