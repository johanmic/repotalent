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

interface RenderHTMLStyling {
  Paragraph?: string
  Text?: string
  Bold?: string
  ListItem?: string
  BulletList?: string
  Heading?: string
}

export const renderHTML = ({
  json,
  styling = {},
}: {
  json: any
  styling?: RenderHTMLStyling
}) => {
  const parsed = JSON.parse(json)
  return generateHTML(parsed, [
    Document,
    Paragraph.configure({
      HTMLAttributes: {
        class: styling.Paragraph || "opacity-70 text-sm",
        style: styling.Paragraph,
      },
    }),
    Text.configure({
      HTMLAttributes: {
        style: styling?.Text || "",
      },
    }),
    Bold.configure({
      HTMLAttributes: {
        style: styling?.Bold || "",
      },
    }),
    ListItem.configure({
      HTMLAttributes: {
        style: styling?.ListItem || "",
      },
    }),
    BulletList.configure({
      HTMLAttributes: {
        style: styling?.BulletList || "",
      },
    }),
    Heading.configure({
      levels: [1, 2, 3],
      HTMLAttributes: {
        class: "text-md font-semibold mt-4 mb-1",
        style: styling?.Heading || "",
      },
    }),
    // other extensions …
  ])
}
export default function TiptapRenderer({
  className,
  json,
}: {
  className?: string
  json: any
}) {
  if (!json) return null

  const output = useMemo(() => {
    const html = renderHTML({ json })
    return html
  }, [json])

  return (
    <div
      className={`${className} text-sm`}
      dangerouslySetInnerHTML={{ __html: output }}
    />
  )
}
