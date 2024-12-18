import Image from "next/image"
import { Hero } from "@/components/landing/hero"
import { Pricing } from "@/components/pricing"
import { Feature } from "@/components/landing/feature"
import { TopMenu } from "@/components/landing/topMenu"
import { Typewriter } from "@/components/ui/typewriter"
import { DotBackground } from "@/components/ui/dot-background"
import { BigFeature } from "@/components/landing/bigFeature"
export default function Home() {
  return (
    <div className="font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col  max-w-6xl justify-center items-center mx-auto p-4">
        <TopMenu />
        <Hero />
        <Feature
          title={
            <div>
              Generate and export job descriptions from your <br />
              <span className="bg-black text-white px-2">
                <Typewriter
                  words={[
                    "package.json",
                    "requirements.txt",
                    "Makefile",
                    "Podfile.lock",
                  ]}
                />
              </span>
            </div>
          }
          subtitle="Intutive generation of job descriptions export to markdown or PDF"
          image="/questions.png"
          badge="Platform"
        />
        <Feature
          title="Rich Job Post Edior"
          subtitle="Edit generated job descriptions, add extra details. Export to markdown or PDF"
          image="/editor.png"
          badge="Platform"
          reverse
        />
        <BigFeature
          title="Kick ass Job board"
          subtitle="Publish your jobs on our job board and get candidates, Candidates can search job details titles even npm/pip/pod packages!"
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
          <Pricing mode="landing" />
        </DotBackground>
      </main>
    </div>
  )
}
