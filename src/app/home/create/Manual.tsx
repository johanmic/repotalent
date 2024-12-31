"use client"

import CodeParser from "@/components/codeParser"
import UploadForm from "@/components/uploadForm"
import { createJobPost } from "@actions/jobpost"
import { useEffect, useState } from "react"
import { AcceptedFileName } from "@/utils/filenames"

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
  const [isProcessing, setIsProcessing] = useState(false)
  const [showCodeParser, setShowCodeParser] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [fileData, setFileData] = useState<{
    filename: AcceptedFileName
    data: string
  } | null>(initialFileData || null)

  const submit = async () => {
    if (!fileData?.filename || !fileData?.data?.length || isProcessing) return
    setSubmitted(true)

    try {
      setIsLoading(true)
      setIsProcessing(true)
      setShowCodeParser(true)
      await createJobPost({
        ...fileData,
        meta: {
          repo: metadata?.repo,
          owner: metadata?.owner,
          path: metadata?.path,
        },
      })
    } catch (error) {
      console.error("Error processing file:", error)
    } finally {
      setIsLoading(false)
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    if (!isLoading && fileData) {
      setShowCodeParser(true)
    }
  }, [fileData, isLoading])

  return (
    <div className="space-y-6 flex flex-col h-full min-h-screen">
      <h1 className="text-2xl font-bold">Create job description</h1>
      {!submitted && (
        <UploadForm
          onUpdate={setFileData}
          fileData={fileData}
          showDropzone={showDropzone}
          onSubmit={submit}
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
