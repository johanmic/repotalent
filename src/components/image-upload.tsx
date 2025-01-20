import { signImageUrl } from "@/app/actions/image"
import { useCallback, useState } from "react"
import Dropzone from "shadcn-dropzone"
import { Button } from "@/components/ui/button"
import Icon from "@/components/icon"

interface ImageUploadProps {
  image: string | null
  onUpload: (image: string) => void
}

export const ImageUpload = ({ image, onUpload }: ImageUploadProps) => {
  const [tmpImage, setTmpImage] = useState(image)
  const [isPickerActive, setIsPickerActive] = useState(false)

  const handleClick = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  const uploadHandler = useCallback(
    async (file: File) => {
      if (isPickerActive) {
        console.warn("Upload already in progress")
        return
      }

      try {
        setIsPickerActive(true)
        const signedUrl = await signImageUrl({ mimeType: file.type })

        const response = await fetch(signedUrl.signedUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        })

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`)
        }

        onUpload(signedUrl.path)
      } catch (error) {
        console.error("Upload error:", error)
        // Reset the temporary image if upload fails
        setTmpImage(image)
      } finally {
        setIsPickerActive(false)
      }
    },
    [onUpload, isPickerActive, image]
  )

  return (
    <Dropzone
      useFsAccessApi={false}
      dropZoneClassName="hover:bg-transparent border-2 border-dashed border-gray-300 w-32 h-32 rounded-full overflow-hidden"
      accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp", ".avif"] }}
      onDrop={async (files) => {
        if (files.length === 0 || isPickerActive) {
          return
        }
        const file = files[0]
        try {
          setTmpImage(URL.createObjectURL(file))
          await uploadHandler(file)
        } catch (error) {
          console.error("Drop handling error:", error)
          setTmpImage(image)
        }
      }}
      disabled={isPickerActive}
      onFileDialogOpen={() => {
        if (isPickerActive) return false
        setIsPickerActive(true)
        return true
      }}
      onFileDialogCancel={() => {
        setIsPickerActive(false)
      }}
    >
      {({ getRootProps, open }) => (
        <div {...getRootProps()}>
          {tmpImage ? (
            <div className="flex flex-col items-center relative justify-center text-center gap-2">
              <img
                src={tmpImage}
                alt="Uploaded image"
                className="w-32 h-32 object-cover rounded-full inset-0"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white rounded-full p-3">
                  <Icon name="pen" className="w-4 h-4" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center gap-2 p-2">
              <p className="text-xs">Drag here or upload</p>
              <Button
                size="sm"
                variant="outline"
                disabled={isPickerActive}
                type="button"
                onClick={(e) => {
                  handleClick(e)
                  open()
                }}
              >
                Upload
              </Button>
            </div>
          )}
        </div>
      )}
    </Dropzone>
  )
}
