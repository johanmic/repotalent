import Bold from "@tiptap/extension-bold"
// Option 2: Browser-only (lightweight)
// import { generateJSON } from '@tiptap/core'
import Document from "@tiptap/extension-document"
import Paragraph from "@tiptap/extension-paragraph"
import Text from "@tiptap/extension-text"
import Heading from "@tiptap/extension-heading"
import ListItem from "@tiptap/extension-list-item"
import BulletList from "@tiptap/extension-bullet-list"
// Option 1: Browser + server-side
import { generateHTML, generateJSON } from "@tiptap/html"
import React, { useMemo } from "react"

export default function TiptapRenderer({
  className,
  json,
}: {
  className?: string
  json: any
}) {
  if (!json) return null

  const output = useMemo(() => {
    const parsed = JSON.parse(json)
    return generateHTML(parsed, [
      Document,
      Paragraph.configure({
        HTMLAttributes: {
          class: "opacity-70 text-sm",
        },
      }),
      Text,
      Bold,
      ListItem,
      BulletList,
      Heading.configure({
        levels: [1, 2, 3],
        HTMLAttributes: {
          class: "text-md font-semibold mt-4 mb-1",
        },
      }),
      // other extensions …
    ])
  }, [json])

  return (
    <div
      className={`${className} text-sm`}
      dangerouslySetInnerHTML={{ __html: output }}
    />
  )
}
