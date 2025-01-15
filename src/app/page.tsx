import Image from "next/image"
import { Hero } from "@/components/landing/hero"
import { Pricing } from "@/components/pricing"
import { Feature } from "@/components/landing/feature"
import { TopMenu } from "@/components/landing/topMenu"
import { Typewriter } from "@/components/ui/typewriter"
import { DotBackground } from "@/components/ui/dot-background"
import { BigFeature } from "@/components/landing/bigFeature"
import { acceptedFileNames } from "@/utils/filenames"
import { Metadata } from "next"
import { SiteFooter } from "@/components/landing/footer"
import { getProducts } from "./actions/product"
import { Title } from "@/components/title"
export const metadata: Metadata = {
  title: "Job Description Generator",
  description: "Generate job descriptions in one click",
  openGraph: {
    title: "Job Description Generator",
    description: "Generate job descriptions in one click",
    url: "https://repotalent.com",
    siteName: "Job Description Generator",
    images: [{ url: "/OG.png" }],
  },
}

export default async function Home() {
  const plans = await getProducts()
  return (
    <div className="font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col  max-w-6xl justify-center items-center mx-auto p-4">
        <TopMenu />
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
              <div className="text-lg font-black text-rose-500">
                500-1500 leads
              </div>
              <p className="pt-2">
                is what an average{" "}
                <span className="bg-black text-white text-xs font-bold p-2 rounded-lg">
                  package.json
                </span>{" "}
                will find*
              </p>
              <p className="pt-4 text-[10px]">
                *This is an estimate, the number of leads will vary based on the
                size of your codebase and the number of packages you use.
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
        <DotBackground>
          <Pricing mode="landing" plans={plans} />
        </DotBackground>
      </main>
      <SiteFooter />
    </div>
  )
}
