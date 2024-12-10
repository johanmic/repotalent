"use client"

import CodeParser from "@/components/codeParser"
import UploadForm from "@/components/uploadForm"
import { createJobPost } from "@actions/jobpost"
import { useEffect, useState } from "react"

const NewPost = () => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [showCodeParser, setShowCodeParser] = useState(false)
  const [fileData, setFileData] = useState<{
    filename: string
    data: string
  } | null>(null)

  useEffect(() => {
    async function handleFileData() {
      if (!fileData?.filename || !fileData?.data || isProcessing) return

      try {
        setIsProcessing(true)
        setShowCodeParser(true)
        await createJobPost(fileData)
      } catch (error) {
        console.error("Error processing file:", error)
      } finally {
        // Hide code parser after delay
        setTimeout(() => {
          setShowCodeParser(false)
          setIsProcessing(false)
        }, 3000)
      }
    }

    handleFileData()
  }, [fileData, isProcessing])

  return (
    <div className="space-y-6 flex flex-col h-full min-h-screen">
      <h1 className="text-2xl font-bold">Create a new post</h1>
      {!fileData && <UploadForm onUpdate={setFileData} />}
      {showCodeParser && <CodeParser />}
    </div>
  )
}

export default NewPost
