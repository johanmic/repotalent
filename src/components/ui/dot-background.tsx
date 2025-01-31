import React from "react"
import { cn } from "@/lib/utils"
export function DotBackground({
  children,
  className = "w-full h-[50rem]",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "dark:bg-black bg-white  dark:bg-dot-white/[0.2] bg-dot-black/[0.2] relative flex",
        className
      )}
    >
      {/* Radial gradient for the container to give a faded look */}
      <div className="absolute pointer-events-none inset-0 z-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <div className="text-4xl sm:text-7xl font-bold relative z-20 bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-500 py-8"></div>
      <div className="relative z-20 w-full">{children}</div>
    </div>
  )
}
