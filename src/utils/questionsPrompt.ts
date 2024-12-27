"use server"
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

const packageJSONDescription = `
  look for design systems, build systems, react, next, node, typescript, etc.
  also look for any other technologies that are not mentioned in the code but are used in the project.
  if react is over version 19 and next is over version 15, indicate that the should be up to date.

  instructions:
  packages: no more than 5,group packages and understand the meaning of them. dont list exact names but understands what they are for, if there are a lot of the same just make that as one example @radix/ @prisma/ @types
  tags: add a few tags that describe the project, looking for react, next, node, typescript, etc, include design systems, build systems, etc
  check the license of the project, if it is MIT, Apache, etc, indicate that.

  determine open source on 
`

const requirementsDescription = `
this is a Python project.
look for the most important packages and technologies used in the project.
`

const responseFixture = {
  suggestedTitle: "Senior Full-Stack Next.js Developer",
  seniority: 0.8,
  packages: [
    "Next.js for server-side rendering and build tools",
    "React for UI development",
    "Radix UI for accessible component libraries",
    "Supabase for backend and authentication",
    "React Hook Form for form management",
    "Framer Motion for animations",
  ],
  questions: [
    "Is the candidate expected to design or implement new features using TailwindCSS-based design systems?",
    "Should the candidate have expertise in handling server-side rendering and API integration using Next.js?",
    "Do they need experience working with database or authentication systems similar to Supabase?",
    "Is knowledge of schema validation libraries like Zod essential for the role?",
  ],
  tags: [
    "Next.js",
    "React",
    "TypeScript",
    "Supabase",
    "Design Systems",
    "TailwindCSS",
    "Radix UI",
    "Framer Motion",
    "Build Systems",
  ],
}

const getPrompt = (filename: string): string => {
  switch (filename) {
    case "package.json":
      return packageJSONDescription
    case "requirements.txt":
      return requirementsDescription
    default:
      return ""
  }
}

export interface PrepQuestionsResponse {
  seniority: number
  suggestedTitle: string
  packages: string[]
  questions: string[]
  tags: string[]
}

export const prepareQuestions = async ({
  data,
}: {
  data: {
    filename: string
    data: string
  }
}): Promise<PrepQuestionsResponse> => {
  try {
    const filename = data.filename
    const dataString = data.data
    const languagePrompt = getPrompt(filename)
    const prompt = `
    we are creating a job description for a technical role.
  we are basing it from the project ${filename} 
  here is the content :
  ${dataString}

  make them no more than 4. make them yes or no questions.

  ask a few questions that will help us create a good job description. make them distinct from the Packages, since they rate those.
  also extract the most important packages and technologies used in the project.
  also check if there are any versions that are very low like 0.0.1 which means they are using unstable versions and factor that in to the questions
  group out packages, technologies and platforms,

  questions:
  questions are for help tuning the job description. not to the applicant. ENSURE THE QUESTIONS ARE DISTINCT FROM THE PACKAGES.
  ask questions to improve the quality of the job description.

  title: make it a good title and a little bit more descriptive than "Senior XX developer"
  ${languagePrompt}

  always return the following json format:
  based on the project, what is the seniority level of the candidate? from 0 to 1, 0 being the lowest and 1 being the highest.
  it can never be 0, but it can be 1. Base the seniority on the mix of the packages, technologies and platforms used.
  suggest a title for the job description based on the project.

  


  {
    suggestedTitle: "Senior Next.js Developer",
    openSource: true,
    seniority: 0.7,
      "packages": [
          "package1",
          "package2",
          "package3"
      ],
      "questions": [
          "question1",
          "question2",
          "question3"
      ],
      "tags": [
          "tag1",
          "tag2",
          "tag3"
      ]
  }


`
    // const cleanedText = responseFixture
    // const results = await prisma.jobPost.create({
    //   data: {
    //     title: cleanedText.suggestedTitle,
    //     seniority: cleanedText.seniority,
    //     source: filename,
    //   },
    // })

    // return responseFixture

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: "You are a friendly assistant!",
      prompt: `Create a post about ${prompt}`,
    })

    // Add validation and cleanup of the response
    const cleanedText = text
      .trim()
      .replace(/```json/g, "")
      .replace(/```/g, "")
    console.log(cleanedText)
    const parsedResponse = JSON.parse(cleanedText)

    // Validate the response structure
    if (!parsedResponse || typeof parsedResponse !== "object") {
      throw new Error("Invalid response format")
    }
    // const results = await prisma.jobPost.create({
    //   data: {
    //     title: parsedResponse.suggestedTitle,
    //     seniority: parsedResponse.seniority,
    //     source: filename,
    //     slug: `${parsedResponse.suggestedTitle}-${organizationName}`,
    //   },
    // })

    return parsedResponse as PrepQuestionsResponse
  } catch (error) {
    console.error("Error processing questions:", error)
    // Fallback to fixture data in case of error
    return responseFixture
  }
}
