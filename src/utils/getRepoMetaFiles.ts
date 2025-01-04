import { listRepoFiles, getFileContent } from "@/app/actions/github"

import { AcceptedFileName } from "./filenames"
const getFileTypes = (type: AcceptedFileName): string[] | null => {
  switch (type) {
    case "package.json":
      return [
        "components.json",
        "tailwind.config.js",
        "tailwind.config.ts",
        "postcss.config.js",
        "postcss.config.ts",
      ]
    case "requirements.txt":
      return null
    case "Podfile.lock":
      return null
    default:
      return null
  }
}

export const getRepoMetaFiles = async ({
  path,
  owner,
  repo,
  type,
}: {
  path: string
  owner: string
  repo: string
  type: AcceptedFileName
}): Promise<string | null> => {
  try {
    const files = await listRepoFiles(path)
    if (!files || files.length === 0) {
      console.warn("No files found in repository")
      return null
    }

    const metaFiles = getFileTypes(type)
    if (!metaFiles) {
      return null
    }

    const matchedFiles = files.filter((file) => metaFiles.includes(file.name))
    if (!matchedFiles.length) {
      console.warn("No matching meta files found")
      return null
    }

    const metaFileContent = await Promise.allSettled(
      matchedFiles.map(async (file) => {
        try {
          const results = await getFileContent({ owner, repo, path: file.path })
          return {
            filename: file.name,
            content: results,
          }
        } catch (err) {
          console.warn(`Failed to fetch content for ${file.path}:`, err)
          return null
        }
      })
    )

    const filteredContent = metaFileContent
      .filter(
        (
          result
        ): result is PromiseFulfilledResult<{
          filename: string
          content: string
        }> => result.status === "fulfilled" && result.value !== null
      )
      .map((result) => result.value)
      .filter((x) => x.content && x.content.length > 0)

    if (!filteredContent.length) {
      return null
    }

    return `also consider the following files: ${filteredContent
      .map((x) => {
        if (x.filename === "components.json") {
          if (x.content.includes("shadcn")) {
            return `important: focus on shadcn and not radix ui ${
              x.filename
            }\n${x.content.substring(0, 3000)}\n`
          }
        }
        return `${x.filename}\n${x.content.substring(0, 500)}\n`
      })
      .join("\n")}`
  } catch (error) {
    console.error("Error getting repo meta files", error)
    return null
  }
}
