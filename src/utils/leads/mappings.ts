import { DBGithubRepo } from "@/app/actions/github"
export const getTopPercent = (
  followers: number
): { text: string | null; color: string } => {
  if (followers >= 10000) return { text: "top 1%", color: "#1e40af" }
  if (followers >= 3000) return { text: "top 2%", color: "#1d4ed8" }
  if (followers >= 1000) return { text: "top 5%", color: "#64748b" }
  if (followers >= 500) return { text: "top 10%", color: "#1f2937" }
  if (followers >= 300) return { text: "top 15%", color: "#1f2937" }
  if (followers >= 150) return { text: "top 20%", color: "#1f2937" }
  if (followers >= 80) return { text: "top 25%", color: "#1f2937" }
  if (followers >= 30) return { text: "top 30%", color: "#1f2937" }
  return { text: null, color: "#1f2937" }
}

export const rankGithubRepo = (repo: DBGithubRepo) => {
  const ageInYears =
    (Date.now() - new Date(repo.repoCreatedAt ?? new Date()).getTime()) /
    3.154e10
  const engagementScore =
    (repo.stars || 0) + (repo.watchers || 0) * 2 + (repo.forks || 0) * 1.5
  const scorePerYear = engagementScore / Math.max(1, ageInYears)

  if (scorePerYear >= 5000)
    return {
      text: "High-traffic Repo",
      color: "text-purple-600 border-purple-300",
    }
  if (scorePerYear >= 2000)
    return {
      text: "Established Project",
      color: "text-blue-600 border-blue-300",
    }
  if (scorePerYear >= 1000)
    return { text: "Popular Repo", color: "text-green-600 border-green-300" }
  if (scorePerYear >= 500)
    return {
      text: "Growing Project",
      color: "text-emerald-600 border-emerald-300",
    }
  if (scorePerYear >= 200)
    return { text: "Active Repository", color: "text-teal-600 border-teal-300" }

  return { text: "In Development", color: "text-gray-600 border-gray-300" }
}

export const mapRating = (rating: number) => {
  if (rating >= 4) return "High"
  if (rating >= 3) return "Medium"
  return "Low"
}
