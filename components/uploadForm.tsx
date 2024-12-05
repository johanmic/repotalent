"use client"
import Dropzone, { DropzoneState } from "shadcn-dropzone"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
const UploadForm = () => {
  return (
    <div>
      <Dropzone>
        {(dropzone: DropzoneState) => (
          <div className="space-y-2 flex flex-col items-center w-full">
            {dropzone.isDragAccept ? (
              <div className="text-sm font-medium">Drop your files here!</div>
            ) : (
              <div className="flex items-center flex-col gap-1.5">
                <div className="flex items-center flex-row gap-0.5 text-sm font-medium">
                  Upload files
                </div>
              </div>
            )}
            <Textarea placeholder="Write your post here..." />
          </div>
        )}
      </Dropzone>

      <Button>Create Post</Button>
    </div>
  )
}

export default UploadForm
