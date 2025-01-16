import { BigFeature } from "@/components/landing/bigFeature"
import FAQ from "@/components/landing/faq"
import { Feature } from "@/components/landing/feature"
import { SiteFooter } from "@/components/landing/footer"
import { Hero } from "@/components/landing/hero"
import { TopMenu } from "@/components/landing/topMenu"
import { Pricing } from "@/components/pricing"
import { StatsCounter } from "@/components/stats-counter"
import { DotBackground } from "@/components/ui/dot-background"
import { Typewriter } from "@/components/ui/typewriter"
import { acceptedFileNames } from "@/utils/filenames"
import { Metadata } from "next"
import { getProducts } from "./actions/product"

type SearchParams = Promise<{
  ref?: string | null
}>

interface HomeProps {
  searchParams: SearchParams
}

export const metadata: Metadata = {
  title: "Repotalent - Job Description Generator and Lead Finder",
  description: "Generate job descriptions and find leads in one click",
  openGraph: {
    title: "Repotalent - Job Description Generator and Lead Finder",
    description: "Generate job descriptions and find leads in one click",
    url: "https://repotalent.com",
    siteName: "Repotalent - Job Description Generator and Lead Finder",
    images: [{ url: "/OG.png" }],
  },
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams
  const plans = await getProducts()
  return (
    <div className="font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col max-w-6xl justify-center items-center mx-auto p-4 pt-16">
        <TopMenu promoRef={params.ref} />
        <Hero />
        <Feature
          title={
            <div id="features">
              Generate job descriptions from
              <br />
              <span className="bg-black text-white px-2">
                <Typewriter words={[...acceptedFileNames]} />
              </span>
            </div>
          }
          subtitle="Job descriptions generated in one click"
          image="/questions.png"
          badge="Platform"
        />
        <Feature
          title="Rich Job Post Editor"
          subtitle="Fine-tune job auto-generated job descriptions and export them to markdown or PDF."
          image="/editor.png"
          badge="Platform"
          reverse
        />
        <BigFeature
          title="Leads"
          subtitle="Repotalent scans all packages you use to source candidates from github"
          features={[
            "Qualified leads based on open-source contributions",
            "Search by location, languages, libraries, and more",
            "Fetches leads from github",
            "Verified “hireable” status",
            "Bookmarks leads",
            "Auto writes intros (coming soon)",
          ]}
          animatedBoarder={false}
          image="/leads2.png"
          badge="Pro Feature"
          extra={
            <div>
              <div className="text-4xl flex gap-2 font-black text-rose-500">
                <StatsCounter number={500} /> - <StatsCounter number={1500} />{" "}
                leads
              </div>
              <p className="pt-2">
                is what an average{" "}
                <span className="bg-black text-white text-xs font-bold p-2 rounded-lg">
                  package.json
                </span>{" "}
                will find*
              </p>
              <p className="pt-4 text-[10px]">
                *the number of leads will vary based on the size of your
                codebase. Not all leads are marked hireable. not all have emails
              </p>
            </div>
          }
          reverse
        />
        <BigFeature
          title="Job board included"
          subtitle="Your openings will be listed on our job board, where developers can search by job details, titles, or even specific libraries and tools from npm, pip, or CocoaPods to find their next gig."
          image="/jobboard.png"
          features={[
            "High quality jobs for real developers",
            "Smart search",
            "SEO optimized",
          ]}
          badge="Job board"
          CTA="Open Job board"
          CTA_link="/jobs"
        />
        <DotBackground className="">
          <Pricing mode="landing" plans={plans} />
        </DotBackground>
        <FAQ />
      </main>
      <SiteFooter />
    </div>
  )
}
