"use client"
import AppIcon from "@/components/appIcon"
import Icon from "@/components/icon"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import Dropzone, { DropzoneState } from "shadcn-dropzone"
import { toast } from "sonner"
import * as z from "zod"
import { acceptedFileNames, AcceptedFileName } from "@/utils/filenames"
const schema = z.object({
  filename: z.string(),
  data: z.string(),
})

const detectFileType = (content: string): string => {
  if (
    content.includes('"dependencies":{') ||
    content.includes('"dependencies": {')
  ) {
    return "package.json"
  }
  if (
    /^[a-zA-Z0-9\-_.]+==[\d.]+$/m.test(content) ||
    content.includes("pip install")
  ) {
    // Matches patterns like "package==1.0.0"
    return "requirements.txt"
  }
  if (content.includes("COCOAPODS: ") || content.includes("target ")) {
    return "Podfile.lock"
  }
  if (content.includes("flutter") && content.includes("dependencies:")) {
    return "pubspec.yaml"
  }
  if (content.includes(".PHONY:") || /^[\w\-]+:/m.test(content)) {
    // Matches Makefile targets
    return "Makefile"
  }
  if (
    content.includes("tool.poetry.dependencies") ||
    content.includes("tool.poetry") ||
    content.includes("dependencies = [")
  ) {
    return "pyproject.toml"
  }
  return "package.json" // default fallback
}

interface UploadFormProps {
  // onUpdate: (questions: { filename: AcceptedFileName; data: string }) => void
  onSubmit: (fileData: { filename: AcceptedFileName; data: string }) => void
  fileData: { filename: AcceptedFileName; data: string } | null
  showDropzone?: boolean
}

const UploadForm = ({
  // onUpdate,
  fileData,
  showDropzone,
  onSubmit,
}: UploadFormProps) => {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      filename: "package.json",
      data: "",
    },
  })

  useEffect(() => {
    if (fileData) {
      form.setValue("filename", fileData.filename)
      form.setValue("data", fileData.data)
    }
  }, [fileData])

  useEffect(() => {
    const data = form.watch("data")
    if (data) {
      const detectedType = detectFileType(data)
      if (detectedType !== form.watch("filename")) {
        form.setValue("filename", detectedType)
      }
    }
  }, [form.watch("data")])

  const handleSubmit = form.handleSubmit((data) => {
    if (data.data.trim() === "") {
      toast.error("Please enter some content before submitting")
      return
    }
    // onUpdate({ filename: data.filename as AcceptedFileName, data: data.data })
    onSubmit({ filename: data.filename as AcceptedFileName, data: data.data })
  })

  return (
    <div className="gap-4 flex flex-col h-full">
      <form onSubmit={handleSubmit} className="gap-2 flex flex-col h-full">
        <Select
          defaultValue="package.json"
          onValueChange={(value) => form.setValue("filename", value)}
          value={form.watch("filename")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filename" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="package.json">
              <div className="flex items-center gap-2">
                <AppIcon name="typescript" />
                <span>package.json</span>
              </div>
            </SelectItem>
            <SelectItem
              value="requirements.txt"
              className="flex items-center gap-2"
            >
              <div className="flex items-center gap-2">
                <AppIcon name="python" />
                <span>requirements.txt</span>
              </div>
            </SelectItem>
            <SelectItem
              value="pyproject.toml"
              className="flex items-center gap-2"
            >
              <div className="flex items-center gap-2">
                <AppIcon name="python" />
                <span>pyproject.toml</span>
              </div>
            </SelectItem>
            <SelectItem value="Makefile">
              <div className="flex items-center gap-2">
                <AppIcon name="makefile" />
                <span>Makefile</span>
              </div>
            </SelectItem>
            <SelectItem value="Podfile.lock">
              <div className="flex items-center gap-2">
                <AppIcon name="podfile" />
                <span>Podfile.lock</span>
              </div>
            </SelectItem>
            <SelectItem value="pubspec.yaml">
              <div className="flex items-center gap-2">
                <AppIcon name="flutter" />
                <span>pubspec.yaml</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <Textarea
          placeholder="Enter your package.json / requirements.txt / Makefile / Podfile content here..."
          className="min-h-[500px] lg:min-h-[500px] h-full max-h-[60vh] text-xs text-white bg-zinc-800 w-full font-mono"
          {...form.register("data")}
        ></Textarea>
        <Button type="submit">Create Job Description</Button>
      </form>
      {showDropzone && (
        <Dropzone
          noClick
          containerClassName="border-none"
          dropZoneClassName="hover:bg-transparent p-4 h-full flex flex-col  "
          accept={{ "text/plain": [".txt", ".json"] }}
          onDrop={async (files) => {
            if (files.length === 0) return
            const file = files[0]
            if (!acceptedFileNames.includes(file.name as AcceptedFileName)) {
              toast.error(`File type not supported: ${file.name}`)
              return
            }

            //   onUpdate({ filename: file.name, data: await file.text() })
            form.setValue("data", await file.text())
            form.setValue("filename", file.name)
          }}
        >
          {(dropzone: DropzoneState) => (
            <div
              // className="space-y-2 flex flex-col w-full hover:bg-transparent"
              className="flex flex-col h-full w-full"
            >
              {dropzone.isDragAccept ? (
                <div className="text-sm font-medium">Drop your files here!</div>
              ) : (
                <div className="flex items-center flex-col gap-1.5 h-32 justify-center">
                  <div className="flex items-center flex-row gap-0.5 text-sm font-medium">
                    <Icon name="file" />
                    <p>Drag a package file here</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </Dropzone>
      )}
    </div>
  )
}

export default UploadForm
