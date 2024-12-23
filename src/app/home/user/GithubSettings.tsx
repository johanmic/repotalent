"use client"
import { Button } from "@/components/ui/button"
import { removeGithubApp } from "@actions/github"
import { Text } from "@/components/text"

const GithubSettings = () => {
  return (
    <div className="flex flex-col gap-2 border-destructive border-2 p-4 rounded-md mt-4">
      <Text className="text-red-500 font-bold">Danger Zone</Text>
      <div>
        <Text>
          If want to update access to repos or organizations you need to remove
          the app and install again
        </Text>
        <Button variant="destructive" onClick={() => removeGithubApp()}>
          Remove Github App
        </Button>
      </div>
    </div>
  )
}

export default GithubSettings
