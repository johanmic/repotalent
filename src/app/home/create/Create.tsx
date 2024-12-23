import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

import Github from "./Github"
import Manual from "./Manual"

const Create = () => {
  return (
    <Tabs defaultValue="github">
      <TabsList>
        <TabsTrigger value="github">Github</TabsTrigger>
        <TabsTrigger value="manual">Manual</TabsTrigger>
      </TabsList>
      <TabsContent value="github">
        <Github />
      </TabsContent>
      <TabsContent value="manual">
        <Manual />
      </TabsContent>
    </Tabs>
  )
}

export default Create
