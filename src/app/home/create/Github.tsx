"use client"

import { useCallback, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import AppIcon from "@/components/appIcon"
import { Icon } from "@/components/icon"
import { Title } from "@/components/title"
import {
  listRepoFolders,
  getRepo,
  listUserRepos,
  getFileContent,
  GithubRepo,
} from "@/app/actions/github"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
dayjs.extend(relativeTime)
import Manual from "./Manual"

interface GithubItem {
  name: string
  type: "dir" | "file"
}

const allowedFiles = [
  "package.json",
  "requirements.txt",
  "Makefile",
  "Podfile.lock",
]

const GithubPicker = () => {
  const [repos, setRepos] = useState<GithubRepo[]>([])
  const [folders, setFolders] = useState<string[]>([])
  const [selectedRepo, setSelectedRepo] = useState<GithubRepo | null>(null)
  const [currentPath, setCurrentPath] = useState<string>("")
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [fileData, setFileData] = useState<{
    filename: string
    data: string
  } | null>(null)
  // Fetch repos on mount
  useEffect(() => {
    const fetchRepos = async () => {
      const repos = await listUserRepos()
      setRepos(
        repos.map((repo) => ({
          ...repo,
          full_name: repo.fullName,
          updated_at: repo.updated_at ?? new Date().toISOString(),
        }))
      )
    }
    fetchRepos()
  }, [])

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
        console.log("Folder items:", items)
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
          filename: fullPath,
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
  if (selectedFile && fileData) {
    return (
      <Manual
        initialFileData={fileData}
        showDropzone={false}
        metadata={{
          repo: selectedRepo?.name,
          path: currentPath,
        }}
      />
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
        <div className="grid grid-cols-1 gap-2 bg-sidebar p-4 rounded-lg">
          {repos.map((repo) => {
            const updated = dayjs(repo.updated_at)
            const isOld = updated.isBefore(dayjs().subtract(1, "month"))
            return (
              <Button
                key={repo.id}
                variant="outline"
                className={`justify-start ${isOld ? "opacity-50" : ""}`}
                onClick={() => setSelectedRepo(repo)}
              >
                <AppIcon name="github" className="mr-2 h-4 w-4" />
                <span>{repo.name}</span>
                <span className="ml-2">updated: {updated.fromNow()}</span>
                <Icon name="chevronRight" className="ml-auto h-4 w-4" />
              </Button>
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
