"use client"
import { useRef, useEffect, useCallback, useState, useMemo } from "react"
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
  description?: string | null
  onChange?: (value: Content) => void
  className?: string
}) => {
  const [value, setValue] = useState<Content>(
    description ? JSON.parse(description) : ""
  )
  const [streamedValue, setStreamedValue] = useState<Content>()
  const streamToJSON = useCallback(async (markdown: string) => {
    const parsed = await marked.parse(markdown)
    setStreamedValue(parsed)
  }, [])
  useEffect(() => {
    if (markdown) {
      streamToJSON(markdown)
    }
  }, [markdown])
  useEffect(() => {
    if (onChange) {
      onChange(value)
    }
  }, [value])
  return (
    <MinimalTiptapEditor
      value={value}
      streamedValue={streamedValue}
      onChange={setValue}
      className="w-full text-sm"
      editorContentClassName="p-5"
      output="json"
      placeholder="Type your job description here..."
      autofocus={true}
      editable={true}
      editorClassName="focus:outline-none"
    />
  )
}

export default TextEditor
