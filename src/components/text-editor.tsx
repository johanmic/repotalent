"use client"
import { useRef, useEffect, useState } from "react"
import * as marked from "marked"
import { Content } from "@tiptap/react"
import { MinimalTiptapEditor } from "./minimal-tiptap"

export const TextEditor = ({
  markdown,
  description,
  onChange,
  className,
}: {
  markdown: string
  description?: string
  onChange?: (value: Content) => void
  className?: string
}) => {
  const [value, setValue] = useState<Content>("")
  useEffect(() => {
    if (markdown) {
      const parsed = marked.parse(markdown)
      console.log(parsed)
      setValue(parsed)
    }
  }, [markdown])
  return (
    <MinimalTiptapEditor
      value={value}
      onChange={setValue}
      className="w-full text-sm"
      editorContentClassName="p-5"
      output="html"
      placeholder="Type your description here..."
      autofocus={true}
      editable={true}
      editorClassName="focus:outline-none"
    />
  )
}

export default TextEditor
