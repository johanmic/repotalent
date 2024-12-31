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
  console.log("getRepoMetaFiles", path, owner, repo, type)
  const files = await listRepoFiles(path)
  console.log("files", files)
  const metaFiles = getFileTypes(type)
  console.log("metaFiles", metaFiles)
  if (!metaFiles) {
    return null
  }
  const matchedFiles = files.filter((file) => metaFiles.includes(file.name))
  if (!matchedFiles) {
    return null
  }
  const metaFileContent = await Promise.all(
    matchedFiles.map(async (file) => {
      const results = await getFileContent({ owner, repo, path: file.path })
      return {
        filename: file.name,
        content: results,
      }
    })
  )
  const filteredContent = metaFileContent.filter(
    (x) => x.content && x.content.length > 0
  )

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
}
