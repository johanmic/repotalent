import Bold from "@tiptap/extension-bold"
// Option 2: Browser-only (lightweight)
// import { generateJSON } from '@tiptap/core'
import BulletList from "@tiptap/extension-bullet-list"
import Document from "@tiptap/extension-document"
import Heading from "@tiptap/extension-heading"
import ListItem from "@tiptap/extension-list-item"
import Paragraph from "@tiptap/extension-paragraph"
import Text from "@tiptap/extension-text"
import Link from "@tiptap/extension-link"
import TextStyle from "@tiptap/extension-text-style"
import Blockquote from "@tiptap/extension-blockquote"
import Italic from "@tiptap/extension-italic"
import Strike from "@tiptap/extension-strike"
import Underline from "@tiptap/extension-underline"
import HorizontalRule from "@tiptap/extension-horizontal-rule"
// Option 1: Browser + server-side
import { generateHTML } from "@tiptap/html"
import { useMemo } from "react"

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
  json: string
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
    Link.configure({
      HTMLAttributes: {
        class: "underline",
      },
    }),
    TextStyle.configure({
      HTMLAttributes: {
        style: ({ color }: { color: string }) => ({
          color: color || "inherit",
        }),
      },
    }),
    Blockquote.configure(),
    Italic.configure(),
    Strike.configure(),
    Underline.configure(),
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
    HorizontalRule.configure(),
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
  json: string
}) {
  const output = useMemo(() => {
    if (!json) return null
    const html = renderHTML({ json })
    return html
  }, [json])
  if (!output) return null
  return (
    <div
      className={`${className} text-sm`}
      dangerouslySetInnerHTML={{ __html: output }}
    />
  )
}
