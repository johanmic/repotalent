"use client"

import CodeParser from "@/components/code-parser"
import UploadForm from "@/components/uploadForm"
import { createJobPost } from "@actions/jobpost"
import { useEffect, useState, useCallback } from "react"
import {
  AcceptedFileName,
  isAcceptedFileName,
  removePathFromFilename,
} from "@/utils/filenames"
import { useRouter } from "next/navigation"
interface NewPostProps {
  initialFileData?: {
    filename: AcceptedFileName
    data: string
  }
  showDropzone?: boolean
  metadata?: {
    repo?: string
    path?: string
    owner?: string
  }
}

const NewPost = ({
  initialFileData,
  showDropzone = true,
  metadata,
}: NewPostProps) => {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [showCodeParser, setShowCodeParser] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [fileData, setFileData] = useState<{
    filename: AcceptedFileName
    data: string
  } | null>(null)

  useEffect(() => {
    if (initialFileData) {
      const filename = removePathFromFilename(initialFileData.filename)
      if (filename && isAcceptedFileName(filename)) {
        setFileData({
          filename: filename as AcceptedFileName,
          data: initialFileData.data,
        })
      }
    }
  }, [initialFileData])
  const submit = useCallback(
    async (data: { filename: AcceptedFileName; data: string }) => {
      if (!data?.filename || !data?.data?.length || isProcessing) return
      setSubmitted(true)

      try {
        setIsLoading(true)
        setIsProcessing(true)
        setShowCodeParser(true)
        const job = await createJobPost({
          ...data,
          meta: {
            repo: metadata?.repo,
            owner: metadata?.owner,
            path: metadata?.path,
          },
        })
        if (job) {
          router.push(`/home/jobs/${job.id}/complete`)
        } else {
          router.push("/home/create/error")
        }
      } catch (error) {
        console.error("Error processing file:", error)
        router.push("/home/create/error")
      } finally {
        setIsLoading(false)
        setIsProcessing(false)
      }
    },
    [isProcessing, metadata, router]
  )

  useEffect(() => {
    if (!isLoading && fileData) {
      setShowCodeParser(true)
    }
  }, [fileData, isLoading])

  const handleFormData = (data: {
    filename: AcceptedFileName
    data: string
  }) => {
    setFileData(data)
    submit(data)
  }

  return (
    <div className="space-y-6 flex flex-col h-full">
      <h1 className="text-2xl font-bold">Create job description</h1>
      {!submitted && (
        <UploadForm
          onSubmit={(fileData) => {
            handleFormData(fileData)
          }}
          fileData={fileData}
          showDropzone={showDropzone}
        />
      )}
      {submitted && showCodeParser && fileData && (
        <CodeParser
          data={fileData?.data}
          filename={
            fileData?.filename as
              | "package.json"
              | "requirements.txt"
              | "Podfile.lock"
              | "pyproject.toml"
          }
        />
      )}
    </div>
  )
}

export default NewPost
