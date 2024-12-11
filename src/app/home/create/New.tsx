"use client"

import CodeParser from "@/components/codeParser"
import UploadForm from "@/components/uploadForm"
import { createJobPost } from "@actions/jobpost"
import { useEffect, useState } from "react"

const NewPost = () => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [showCodeParser, setShowCodeParser] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [fileData, setFileData] = useState<{
    filename: string
    data: string
  } | null>(null)

  useEffect(() => {
    async function handleFileData() {
      if (!fileData?.filename || !fileData?.data || isProcessing) return

      try {
        setIsLoading(true)
        setIsProcessing(true)
        setShowCodeParser(true)
        await createJobPost(fileData)
      } catch (error) {
        console.error("Error processing file:", error)
      }
    }

    if (!isLoading) {
      handleFileData()
    }
  }, [fileData, isProcessing, isLoading])

  return (
    <div className="space-y-6 flex flex-col h-full min-h-screen">
      <h1 className="text-2xl font-bold">Create a new post</h1>
      {!fileData && <UploadForm onUpdate={setFileData} />}
      {showCodeParser && <CodeParser />}
    </div>
  )
}

export default NewPost
