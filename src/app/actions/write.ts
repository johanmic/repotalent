"use server"
import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"
import prisma from "@/store/prisma"
import { getUser } from "@/utils/supabase/server"
import { JobPost } from "@actions/jobpost"
import { createStreamableValue } from "ai/rsc"
// This method must be named GET

const makePrompt = (job: JobPost) => {
  return `
  You are a job description generator. You are given a job post and you need to generate a description for it.
  Output simple markdown with titles, lists, paragraphs 
  leave out the following as they are rendered in the job post:
  * job title
  * location
  * company name
  * company website
  * company description
  * where to apply
  * company contact

  The job post is as follows:
  Suggested title: ${job.title}
Use Tone of voice ${job.tone || "neutral"}

  Company name: ${job.organization?.name}
  ${
    job.organization?.website
      ? `Company website: ${job.organization?.website}`
      : ""
  }
  ${
    job.organization?.description
      ? `Company description: ${job.organization?.description}`
      : ""
  }
  ${
    job.organization?.city
      ? `City: ${job.organization.city.name}, Country: ${job.organization.city.country.name}`
      : ""
  }

  Some additional information about the job post:
  
  Job Ratings (1-100) 100 being a subject matter expert:
  ${job.ratings
    ?.map((rating) => `${rating.question}: ${rating.rating}`)
    .join("\n")}

  Job Questions:
  ${job?.questions
    ?.map((question) => `${question.question}: ${question.answer}`)
    .join("\n")}

  Job Tags:
  ${job?.tags?.map((tag) => `${tag.tag.tag}`).join("\n")}

  Job Packages (source ${job.source})
  ${job.packages
    ?.map(
      (pkg) =>
        `${pkg.packageVersion?.package.name} ${pkg.packageVersion?.version}`
    )
    .join("\n")}

   Additional instructions:
  ${job.additionalInfo}


  `
}

const fixutre = `<h1>Job Description: Senior Full-# JobStack Next.js Developer</h1>
<p>We are seeking an experienced Senior Full-Stack Developer Description</p>
<p> proficient in Next.js to join our dynamic team. You will play a crucial role in enhancing our web applications and ensuring a seamlessWe are user experience.</p>
<p> seeking an experienced <strong>Senior Full-Stack Next.js Developer</strong> to join our dynamic team. The ideal candidate will possess a## Key strong proficiency in React and Next Responsibilities</p>
<ul>
<li>Develop and maintain.js, web applications using Next along with.js and React.</li>
<li>Implement a solid understanding of backend technologies. server-side</li>
</ul>
<h2>rendering and API integration.</h2>
<ul>
<li><p>Key Responsibilities Work with component libraries such as</p>
</li>
<li><p>Develop and maintain web applications using <strong>Next Radix UI to create accessible.js</strong> UI elements.</p>
</li>
<li><p>and <strong>React</strong>.</p>
</li>
<li><p>Implement accessible Utilize Sup components using <strong>Radabase forix UI</strong>.</p>
</li>
<li><p>Manage backend services and authentication.</p>
</li>
<li><p>Manage forms form handling with ** effectively usingReact Hook Form**.</p>
</li>
<li><p>React Hook Form.</p>
</li>
<li><p>Collaborate with designers to ensure adherence Integrate to TailwindCSS backend services using <strong>Supabase</strong> for-based design systems.</p>
</li>
<li><p>Optimize application performance and responsiveness.</p>
</li>
</ul>
<h2>authentication and database management Required Skills.</h2>
<ul>
<li></li>
<li>Collaborate <strong>React</strong>: Expertise in UI development with design teams to create user (100/100).
--friendly interfaces **Next.</li>
<li>Optimize applications for performance and scalability.js**: Pro.</li>
</ul>
<h2>Required Skills</h2>
<p>-ficient in server-side rendering and build tools (75/100 **React).</p>
<ul>
<li><strong>Radix UI</strong>**:: Experience with accessible component libraries (75 Expert-level knowledge in/100 UI development.
-).</li>
<li><strong>Supabase</strong> <strong>Next: Knowledge of backend and authentication systems (75/100).
.js</strong>- <strong>React Hook Form</strong>: Skills in form management (75/100).</li>
<li><strong>Framer: Proficient Motion</strong>: Basic in server-side rendering understanding of animations (25/ and build tools.</li>
<li><strong>Radix UI</strong>: Familiarity with accessible component libraries.
100).</li>
<li>**- <strong>Supabase</strong>: Experience inTypeScript backend and authentication systems.</li>
<li><strong>React</strong>: Familiarity Hook Form with TypeScript for better code quality.
**: Knowledge of- **Build Systems form management techniques.</li>
<li><strong>TypeScript</strong>:**: Experience with modern build tools and frameworks Competence in type-safe coding.</li>
</ul>
<h2>Preferred Skills</h2>
<ul>
<li>Knowledge of TailwindCSS practices.</li>
</ul>
<p> and design## Preferred Skills</p>
<p> systems.</p>
<ul>
<li>Familiarity with schema validation libraries like Zod is a- **Framer plus.</li>
</ul>
<h2>Why Motion** Join Us: Basic understanding of animations.</h2>
<ul>
<li><strong>TailwindCSS</strong>: Awareness?</li>
<li>Work in a collaborative and innovative environment.</li>
<li>Opportunity of design systems ( to enhance your skills with cuttingminimal experience required).
-edge technologies.</li>
<li>Contribute- <strong>Schema Validation to impactful</strong>: Familiarity projects that reach a with libraries wide audience.</li>
</ul>
<p>If like Z you areod is a plus passionate about full-stack development and eager to.</p>
<h2>Technical Stack</h2>
<ul>
<li>take on Next.js challenging projects, we</li>
<li>would love to hear from you! React</li>
<li>Supabase</li>
<li>TypeScript</li>
<li>Radix UI</li>
<li>Framer Motion</li>
<li>TailwindCSS</li>
</ul>
<h2>Why Join Us?</h2>
<p>This role offers an exciting opportunity to work with cutting-edge technologies in a collaborative environment. You will have the chance to shape the future of our web applications while working alongside talented professionals. If you are passionate about delivering high-quality software and eager to tackle new challenges, we would love to hear from you!</p>
`
export const writeJobDescription = async ({ jobId }: { jobId: string }) => {
  const stream = createStreamableValue("")

  ;(async () => {
    const { user } = await getUser()
    if (!user?.id) {
      throw new Error("Unauthorized")
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { organization: true },
    })
    if (!dbUser?.organization?.id) {
      throw new Error("User not in organization")
    }

    const job = await prisma.jobPost.findUnique({
      where: { id: jobId, organizationId: dbUser.organization.id },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        questions: true,
        ratings: true,
        organization: {
          include: {
            city: {
              include: {
                country: true,
              },
            },
          },
        },
        packages: {
          include: {
            packageVersion: {
              include: {
                package: true,
              },
            },
          },
        },
      },
    })
    if (!job) {
      throw new Error("Job not found")
    }
    if (job.description) {
      // Simulate streaming for existing description by splitting into characters
      for (const char of fixutre) {
        await new Promise((resolve) => setTimeout(resolve, 0)) // Add small delay
        stream.update(char)
      }
      stream.done()
      return
    }

    const prompt = makePrompt(job as JobPost)
    const { textStream } = await streamText({
      model: openai("gpt-4o-mini"),
      messages: [
        {
          role: "system",
          content:
            "You are a professional job description writer. Write clear, concise, and engaging job descriptions.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      maxTokens: 2000,
    })

    for await (const delta of textStream) {
      stream.update(delta)
    }

    stream.done()
  })()

  return { output: stream.value }
}

export const generate = async ({ input }: { input: string }) => {
  const stream = createStreamableValue("")

  ;(async () => {
    const { textStream } = streamText({
      model: openai("gpt-3.5-turbo"),
      prompt: input,
    })

    for await (const delta of textStream) {
      stream.update(delta)
    }

    stream.done()
  })()

  return { output: stream.value }
}
