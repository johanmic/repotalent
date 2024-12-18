import React from "react"
import { Compare } from "@/components/ui/compare"

export function CompareDemo() {
  return (
    <div className="w-full h-[80vh] min-h-[600px] px-1 flex items-center justify-center [perspective:800px] [transform-style:preserve-3d]">
      <div
        style={{
          transform: "rotateX(5deg) translateZ(0px)",
        }}
        className="p-1 md:p-4 border rounded-3xl dark:bg-neutral-900 bg-neutral-100 border-neutral-200 dark:border-neutral-800 w-full h-3/4"
      >
        <Compare
          firstImage="/pre1.png"
          secondImage="/pre2.png"
          firstImageClassName="object-cover object-left-top w-full"
          secondImageClassname="object-cover object-left-top w-full"
          className="w-full h-full rounded-[22px] md:rounded-lg"
          slideMode="drag"
          autoplay={true}
        />
      </div>
    </div>
  )
}
