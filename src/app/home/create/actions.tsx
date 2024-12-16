// "use server"
// import { generateText } from "ai"
// import { openai } from "@ai-sdk/openai"
// import { getUser } from "@actions/user"
// const packageJSONDescription = `
//  look for design systems, build systems, react, next, node, typescript, etc.
//  also look for any other technologies that are not mentioned in the code but are used in the project.
//  if react is over version 19 and next is over version 15, indicate that the should be up to date.
// `

// const requirementsDescription = `
// this is a Python project.
// look for the most important packages and technologies used in the project.
// `

// const getPrompt = (filename: string): string | void => {
//   switch (filename) {
//     case "package.json":
//       return packageJSONDescription
//     case "requirements.txt":
//       return requirementsDescription
//   }
// }

// export const prepareQuestions = async (formData: FormData) => {
//   const user = await getUser()
//   if (!user) {
//     return { error: "User not found" }
//   }
//   if (!user.organization) {
//     return { error: "Organization not found" }
//   }
//   if (user.creditsInfo?.creditsAvailable === 0) {
//     return { error: "No credits available" }
//   }

//   const filename = formData.get("filename") as string
//   const data = formData.get("data") as string
//   const languagePrompt = getPrompt(filename)
//   const prompt = `
//   we are creating a job description for a technical role.
// we are basing it from the project ${filename}
// here is the content :
// ${data}

// ask a few questions that will help us create a good job description.
// also extract the most important packages and technologies used in the project.
// also check if there are any versions that are very low like 0.0.1 which means they are using unstable versions and factor that in to the questions
// group out packages, technologies and platforms,

// ${languagePrompt}

// return the following json format:
// {
//     "packages": [
//         "package1",
//         "package2",
//         "package3"
//     ],
//     "questions": [
//         "question1",
//         "question2",
//         "question3"
//     ],
//     "tags": [
//         "tag1",
//         "tag2",
//         "tag3"
//     ]
// }

// `
//   console.log(prompt)
//   //   const { text } = await generateText({
//   //     model: openai("gpt-4o"),
//   //     system: "You are a friendly assistant!",
//   //     prompt: `Create a post about ${prompt}`,
//   //   })

//   //   return text
// }
