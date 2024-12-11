import { deburr } from "./deburr"
import slugify from "@sindresorhus/slugify"

export const createSlug = (str: string, inc: number = 0): string => {
  let outInc = inc == 1 ? 2 : inc
  const slug = slugify(str)
  return `${slug}${outInc ? `-${outInc}` : ""}`
}

export const raw = (str: string): string =>
  deburr(str)
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]/g, "")
