"use client"
import TOS from "./tos.mdx"
import React from "react"

export default function Page() {
  return (
    <article className="prose prose-sm md:prose-base lg:prose-lg max-w-4xl mx-auto p-4 prose-headings:text-primary prose-a:text-secondary">
      <div className="bg-base-100 rounded-lg p-6 shadow-lg">
        <TOS />
      </div>
    </article>
  )
}
