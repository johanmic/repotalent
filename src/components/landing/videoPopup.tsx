import { Play } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
const imageURL = "/videodemo.png"
const videoURL =
  "https://cywjzycqiiuvelajqsbd.supabase.co/storage/v1/object/public/video/repotalentdemo.mp4?t=2025-01-20T12%3A44%3A37.643Z"

export const VideoPopup = () => {
  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <div className="relative cursor-pointer group">
            <img
              src={imageURL}
              alt="Video thumbnail"
              className="rounded-lg w-full max-w-[640px]"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/30 p-4 rounded-full group-hover:bg-black/50 transition-colors">
                <Play className="w-8 h-8 ml-1 text-white" />
              </div>
            </div>
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-4xl p-0 m-0">
          <DialogTitle className="p-4">Repotalent in action</DialogTitle>
          <video controls autoPlay muted className="w-full focus:outline-none">
            <source src={videoURL} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </DialogContent>
      </Dialog>
    </div>
  )
}
