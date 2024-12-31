import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

import Github from "./Github"
import Manual from "./Manual"

const Create = ({ hasGithub }: { hasGithub: boolean }) => {
  const defaultTab = hasGithub ? "github" : "manual"
  return (
    <Tabs defaultValue={defaultTab}>
      <TabsList>
        <TabsTrigger value="github">Github</TabsTrigger>
        <TabsTrigger value="manual">Manual</TabsTrigger>
      </TabsList>
      <TabsContent value="github">
        <Github hasGithub={hasGithub} />
      </TabsContent>
      <TabsContent value="manual">
        <Manual />
      </TabsContent>
    </Tabs>
  )
}

export default Create
