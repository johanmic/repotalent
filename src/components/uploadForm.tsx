"use client"
import Dropzone, { DropzoneState } from "shadcn-dropzone"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import AppIcon from "@/components/appIcon"
import Icon from "@/components/icon"
const acceptedFileNames = [
  "package.json",
  "requirements.txt",
  "Makefile",
  "Podfile",
]
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, useForm } from "react-hook-form"

const fixture = `{
  "name": "repotalent",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@ai-sdk/openai": "^1.0.6",
    "@hookform/resolvers": "^3.9.1",
    "@radix-ui/react-checkbox": "^1.1.2",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-select": "^2.1.2",
    "@radix-ui/react-slot": "^1.1.0",
    "@supabase/ssr": "^0.5.2",
    "@supabase/supabase-js": "^2.46.2",
    "ai": "^4.0.11",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "framer-motion": "^11.13.1",
    "input-otp": "^1.4.1",
    "lucide-react": "^0.465.0",
    "next": "15.0.3",
    "next-themes": "^0.4.3",
    "react": "^18",
    "react-dom": "^18",
    "react-hook-form": "^7.53.2",
    "react-icons": "^5.4.0",
    "shadcn-dropzone": "^0.2.1",
    "sonner": "^1.7.0",
    "tailwind-merge": "^2.5.5",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "eslint": "^8",
    "eslint-config-next": "14.2.16",
    "postcss": "^8",
    "tailwindcss": "^3.4.16",
    "typescript": "^5"
  }
}`
const schema = z.object({
  filename: z.string(),
  data: z.string(),
})

const UploadForm = ({
  onUpdate,
}: {
  onUpdate: (questions: { filename: string; data: string }) => void
}) => {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      filename: "package.json",
      data: fixture,
    },
  })
  const handleSubmit = form.handleSubmit((data) => {
    onUpdate({ filename: data.filename, data: data.data })
  })
  return (
    <div className="gap-4 flex flex-col h-full">
      <Dropzone
        noClick
        containerClassName="border-none"
        dropZoneClassName="hover:bg-transparent p-4 h-full flex flex-col  "
        accept={{ "text/plain": [".txt", ".json"] }}
        onDrop={async (files) => {
          if (files.length === 0) return
          const file = files[0]
          if (!acceptedFileNames.includes(file.name)) {
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
      <form onSubmit={handleSubmit} className="gap-2 flex flex-col">
        <Select defaultValue="package.json" {...form.register("filename")}>
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
            <SelectItem value="Makefile">
              <div className="flex items-center gap-2">
                <AppIcon name="makefile" />
                <span>Makefile</span>
              </div>
            </SelectItem>
            <SelectItem value="Podfile">
              <div className="flex items-center gap-2">
                <AppIcon name="podfile" />
                <span>Podfile</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <Textarea
          placeholder="Write your post here..."
          className="min-h-96 text-xs w-full font-mono"
          {...form.register("data")}
        ></Textarea>
        <Button type="submit">Create Post</Button>
      </form>
    </div>
  )
}

export default UploadForm
