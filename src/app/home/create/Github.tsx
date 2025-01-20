"use client"

import {
  getFileContent,
  GithubRepo,
  listRepoFolders,
  listUserRepos,
} from "@/app/actions/github"
import AppIcon from "@/components/appIcon"
import { GithubAppButton } from "@/components/github-app-button"
import { Icon } from "@/components/icon"
import { Title } from "@/components/title"
import { Button } from "@/components/ui/button"
import { AcceptedFileName } from "@/utils/filenames"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { useEffect, useState } from "react"
import Manual from "./Manual"
dayjs.extend(relativeTime)
interface GithubItem {
  name: string
  type: "dir" | "file"
}

const allowedFiles = [
  "package.json",
  "requirements.txt",
  "Makefile",
  "Podfile.lock",
  "pyproject.toml",
]

const GithubPicker = ({ hasGithub }: { hasGithub: boolean }) => {
  const [repos, setRepos] = useState<GithubRepo[]>([])
  const [folders, setFolders] = useState<string[]>([])
  const [selectedRepo, setSelectedRepo] = useState<GithubRepo | null>(null)
  const [currentPath, setCurrentPath] = useState<string>("")
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [fileData, setFileData] = useState<{
    filename: AcceptedFileName
    data: string
  } | null>(null)
  // Fetch repos on mount
  useEffect(() => {
    const fetchRepos = async () => {
      const repos = await listUserRepos()
      console.log(repos)
      setRepos(
        repos.map((repo) => ({
          ...repo,
          language: repo.language ?? undefined,
          full_name: repo.fullName,
          updated_at: repo.updated_at ?? new Date().toISOString(),
          created_at: new Date().toISOString(),
        }))
      )
    }
    if (hasGithub) {
      fetchRepos()
    }
  }, [hasGithub])

  // Fetch folders when repo is selected
  useEffect(() => {
    if (!selectedRepo) return

    const fetchFolders = async () => {
      setIsLoading(true)
      try {
        const items = (await listRepoFolders({
          owner: selectedRepo.owner,
          repo: selectedRepo.name,
          path: currentPath,
        })) as GithubItem[]

        setFolders(
          items.map((item: GithubItem) =>
            item.type === "dir" ? `${item.name}/` : item.name
          )
        )
      } finally {
        setIsLoading(false)
      }
    }
    fetchFolders()
  }, [selectedRepo, currentPath])

  const handleFolderClick = (folder: string) => {
    setCurrentPath(currentPath ? `${currentPath}/${folder}` : folder)
  }

  const handleFileClick = async (file: string) => {
    if (allowedFiles.includes(file)) {
      const fullPath = currentPath ? `${currentPath}/${file}` : file
      setSelectedFile(fullPath)

      setIsLoading(true)
      try {
        const content = await getFileContent({
          owner: selectedRepo!.owner,
          repo: selectedRepo!.name,
          path: fullPath,
        })
        setFileData({
          filename: fullPath as AcceptedFileName,
          data: content,
        })
      } catch (error) {
        console.error("Failed to fetch file content:", error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleBack = () => {
    const newPath = currentPath.split("/").slice(0, -1).join("/")
    setSelectedFile(null)
    setCurrentPath(newPath)
  }
  if (!hasGithub) {
    return (
      <div>
        <p>Github is not installed</p>
        <GithubAppButton installed={false} />
      </div>
    )
  }
  if (selectedFile && fileData) {
    return (
      <div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => setSelectedFile(null)}>
            <Icon name="moveLeft" className="mr-2 h-4 w-4" />
            Back to files
          </Button>
        </div>
        <Manual
          initialFileData={fileData}
          showDropzone={false}
          metadata={{
            repo: selectedRepo?.name,
            owner: selectedRepo?.owner,
            path: currentPath,
          }}
        />
      </div>
    )
  }
  return (
    <div className="space-y-4">
      <Title>
        <AppIcon name="github" />
        Your Repos
      </Title>

      {/* Repository Selection */}
      {!selectedRepo && (
        <div className="grid grid-cols-1 gap-2 bg-sidebar py-4 rounded-lg">
          {repos.map((repo) => {
            const updated = dayjs(repo.updated_at)
            const isOld = updated.isBefore(dayjs().subtract(1, "month"))
            return (
              <div
                key={repo.id}
                // variant="ghost"
                className={`flex my-2 border-b cursor-pointer hover:bg-muted px-2 items-center  justify-start ${
                  isOld ? "opacity-50" : ""
                }`}
                onClick={() => setSelectedRepo(repo)}
              >
                <AppIcon name="github" className="mr-2 h-4 w-4" />
                <div className="flex items-center h-12">
                  <AppIcon
                    name={repo.language?.toLowerCase() as keyof typeof AppIcon}
                    className="mr-2 h-4 w-4"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{repo.name}</span>
                    <span className="text-xs">
                      updated: {updated.fromNow()}
                    </span>
                  </div>
                </div>
                <Icon name="chevronRight" className="ml-auto h-4 w-4" />
              </div>
            )
          })}
        </div>
      )}

      {/* File Browser */}
      {selectedRepo && (
        <div className="space-y-4 bg-sidebar p-4 rounded-lg">
          {/* Navigation Header */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedRepo(null)
                setCurrentPath("")
                setSelectedFile(null)
              }}
            >
              <Icon name="chevronLeft" className="mr-2 h-4 w-4" />
              Back to Repos
            </Button>
            {currentPath && (
              <Button variant="ghost" onClick={handleBack}>
                <Icon name="folderUp" className="mr-2 h-4 w-4" />
                Up
              </Button>
            )}
          </div>

          {/* Current Path */}
          <div className="text-sm text-muted-foreground">
            {selectedRepo.name}/{currentPath}
          </div>

          {/* Files and Folders */}
          <div className="grid grid-cols-1 gap-2">
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Icon name="spinner" className="animate-spin" />
              </div>
            ) : (
              folders.map((item) => {
                const isFile = !item.endsWith("/")
                const name = isFile ? item : item.slice(0, -1)
                const isAllowedFile = isFile && allowedFiles.includes(name)

                return (
                  <Button
                    key={item}
                    variant="ghost"
                    className={`justify-start ${
                      isFile && !isAllowedFile
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    onClick={() =>
                      isFile
                        ? isAllowedFile && handleFileClick(name)
                        : handleFolderClick(name)
                    }
                  >
                    <Icon
                      name={isFile ? "file" : "folder"}
                      className="mr-2 h-4 w-4"
                    />
                    {name}
                  </Button>
                )
              })
            )}
          </div>

          {/* Selected File */}
          {selectedFile && (
            <div className="rounded-lg border p-4 mt-4">
              <h3 className="font-medium">Selected File:</h3>
              <p className="text-sm text-muted-foreground">{selectedFile}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default GithubPicker
