import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const FaqYou = () => {
  const faqs = [
    {
      question: "Do I have to share my entire codebase?",
      answer:
        "No, you can login in with github and auto sync your codebase, however you can also upload a file manually",
    },
    {
      question: "What do you do with my code?",
      answer:
        "We mostly read meta files like package.json, requirements.txt, etc. We do not read much else. We're open source so take a look yourself",
    },
    {
      question: "How do I get the leads database?",
      answer:
        "Leads is a pro feature, pro users tokens also get one month of access to the leads database",
    },
    {
      question: "How does the tokens work",
      answer:
        "Creating a job costs one token. This includes regenerations and edits as well as one month of publishing on the job board",
    },
    {
      question: "Can I create job posts without publishing them?",
      answer:
        "Yes, you can create job posts without publishing them. You can always edit them later. or export them to PDF or Markdown",
    },
    {
      question: "Why dont you have a free option?",
      answer:
        "Generating a job description from code and running multiple calls against APIs is unfortunately a bit pricey. We are working on a free tier, but it is not ready yet.",
    },
    {
      question: "What does Hireable mean",
      answer: (
        <div>
          Hireable is a feature that allows you to indicate that a developer is
          available for hire on your GitHub profile.
          <a href="https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-personal-account-on-github/managing-user-account-settings/about-available-for-hire">
            Learn more
          </a>
        </div>
      ),
    },
    {
      question: "I dont want to be listed as a developer on RepoTalent",
      answer:
        "Sure, you can always email support@repotalent.com and we will mark you as not being listed",
    },
  ]

  return (
    <section className="py-32 relative">
      <div className="container max-w-3xl mx-auto px-4">
        <h1 className="mb-4 text-3xl font-semibold md:mb-11 md:text-5xl">
          Frequently asked questions
        </h1>
        <div className="space-y-2 max-w-3xl">
          {faqs.map((faq, index) => (
            <Accordion key={index} type="single" collapsible>
              <AccordionItem value={`item-${index}`}>
                <AccordionTrigger className="hover:text-foreground/60 hover:no-underline text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FaqYou
