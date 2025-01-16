"use server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import prisma from "@/store/prisma"
import { getUser } from "@/utils/supabase/server"
import { jobPostQuestion, jobPostRatings } from "@prisma/client"

export const reCalculateTitleAndSeniority = async ({
  jobPostId,
  questions,
  ratings,
}: {
  jobPostId: string
  questions: jobPostQuestion[]
  ratings: jobPostRatings[]
}) => {
  const { user } = await getUser()
  if (!user) {
    throw new Error("User not found")
  }
  const job = await prisma.jobPost.findUnique({
    where: { id: jobPostId },
  })
  const prompt = `
    based on the questions evaluate the suggested title and seniority and adjust it to be the same, more junior or more senior.
    seniority is from 0 to 1. 0 is is lowest 1 is a very very senior. 0.1 should be the lowest. each step should be exponentially more senior.

    Use these seniority levels as a guide:
    - 0.3: Junior (1-2 years experience)
    - 0.6: Mid-level (3-5 years experience)
    - 0.8: Senior (6-8 years experience)
    - 1.0: Lead (8+ years experience)

    the answers are made by the user creating the job post. not applicants.
    always return valid json. 
    
    IMPORTANT: ensure the title and the ratings match, 
    

    current title: ${job?.title}
    current seniority: ${job?.seniority}
    

    base it on the questions answerered below
    ${questions
      .map((question) => {
        return `question: ${question.question} \n answer: ${question.answer}`
      })
      .join("\n")}

    ratings:
    ${ratings
      .map((rating) => {
        return `question: ${rating.question} rating: ${rating.rating} \n `
      })
      .join("\n")}

  {
    suggestedTitle:string,
    seniority: Float
    }

    example response: {
      "suggestedTitle": "Senior Next.js Developer",
      "seniority": 0.7,
    }
  
  `

  const res = await generateText({
    model: openai("gpt-4o-mini"),
    system: "You are a job description creator",
    prompt: `Create a job description for a job \n ${prompt}`,
  })

  const usage = res.usage.totalTokens
  await prisma.jobPostTokenUsage.create({
    data: {
      jobPostId: jobPostId,
      tokensUsed: usage,
      userId: user.id,
    },
  })

  const cleanedText = res.text
    .trim()
    .replace(/```json/g, "")
    .replace(/```/g, "")

  const parsedResponse = JSON.parse(cleanedText)

  return parsedResponse
}
