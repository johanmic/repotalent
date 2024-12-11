import { generateJSON } from "@tiptap/html"
import Document from "@tiptap/extension-document"
import Paragraph from "@tiptap/extension-paragraph"
import Text from "@tiptap/extension-text"
import Bold from "@tiptap/extension-bold"
import Heading from "@tiptap/extension-heading"
import * as marked from "marked"
import { Content } from "@tiptap/react"

export const generateJSONFromMarkdown = async (
  markdown: string
): Promise<Content> => {
  const parsed = await marked.parse(markdown)
  const json = generateJSON(parsed, [
    Document,
    Paragraph,
    Text,
    Bold,
    Heading.configure({ levels: [1, 2, 3] }),
  ])
  return json
}
