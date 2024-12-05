"use server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export const createPost = async (formData: FormData) => {
  const { content } = Object.fromEntries(formData.entries())
}
