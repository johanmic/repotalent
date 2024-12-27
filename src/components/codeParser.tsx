"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { useEffect, useMemo, useState } from "react"
// import parsePipRequirementsFile from "pip-requirements-js"
import parsePipRequirementsFile from "@/utils/parseRequirementsTXT"
import { parsePodfileLock } from "@/utils/podfileLockParser"
interface CodeParserProps {
  data?: string
  filename?: "package.json" | "requirements.txt" | "Podfile.lock"
}

const sampleData = `{
  "name": "repotalent",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@ai-sdk/openai": "^1.0.6",
    "@hookform/resolvers": "^3.9.1",
    "@radix-ui/react-checkbox": "^1.1.2",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-select": "^2.1.2",
    "@radix-ui/react-slot": "^1.1.0",
    "@supabase/ssr": "^0.5.2",
    "@supabase/supabase-js": "^2.46.2",
    "ai": "^4.0.11",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "framer-motion": "^11.13.1",
    "input-otp": "^1.4.1",
    "lucide-react": "^0.465.0",
    "next": "15.0.3",
    "next-themes": "^0.4.3",
    "react": "^18",
    "react-dom": "^18",
    "react-hook-form": "^7.53.2",
    "shadcn-dropzone": "^0.2.1",
    "sonner": "^1.7.0",
    "tailwind-merge": "^2.5.5",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "eslint": "^8",
    "eslint-config-next": "14.2.16",
    "postcss": "^8",
    "tailwindcss": "^3.4.16",
    "typescript": "^5"
  }
}`

function parsePackageJson(file: string) {
  return JSON.parse(file)
}

function parseRequirementsTxt(file: string) {
  const reuslts = parsePipRequirementsFile(file)
  console.log(reuslts)
  return reuslts
}

const parsePodfile = (file: string) => {
  console.log("parsePodfile")
  const reuslts = parsePodfileLock(file)
  return reuslts
}

const getFileData = (
  data: string,
  filename: "package.json" | "requirements.txt" | "Podfile.lock"
) => {
  switch (filename) {
    case "package.json":
      return parsePackageJson(data)
    case "requirements.txt":
      return parseRequirementsTxt(data)
    case "Podfile.lock":
      return parsePodfile(data)
  }
}

const CodeParser = ({ data, filename = "package.json" }: CodeParserProps) => {
  const [intialAnimationDone, setIntialAnimationDone] = useState(false)
  const [renderedCount, setRenderedCount] = useState(0)
  const [highlightedItems, setHighlightedItems] = useState<Set<string>>(
    new Set()
  )
  const [currentPaths, setCurrentPaths] = useState<string[]>([])

  const fileData = useMemo(() => {
    if (!data) return null
    return getFileData(data, filename)
  }, [data, filename])

  const calculateSectionLength = (obj: Record<string, string>): number => {
    if (Array.isArray(obj)) return obj.length

    if (typeof obj === "object") {
      const directLength = Object.keys(obj).length
      const maxChildLength = Math.max(
        ...Object.values(obj).map((value) =>
          typeof value === "object" ? calculateSectionLength(value) : 0
        )
      )
      return Math.max(directLength, maxChildLength)
    }

    return 1
  }

  const getAnimationDelay = (section: Record<string, string>) => {
    const sectionLength = calculateSectionLength(section)
    return sectionLength > 20 ? 0.05 : 0.1
  }

  useEffect(() => {
    if (fileData && intialAnimationDone && currentPaths.length > 0) {
      const highlightItems = () => {
        currentPaths.forEach((path, index) => {
          setTimeout(() => {
            setHighlightedItems((prev) => new Set([...prev, path]))
          }, index * (fileData?.length > 20 ? 100 : 200))
        })
      }

      highlightItems()
    }
  }, [intialAnimationDone, currentPaths, fileData?.length])
  if (!data) return null
  const calculateTotalItems = (obj: Record<string, string>): number => {
    return Object.values(obj).reduce((count, value) => {
      if (typeof value === "object") {
        return count + calculateTotalItems(value)
      }
      return count + 1
    }, 0)
  }

  const totalItems = calculateTotalItems(fileData)

  const handleAnimationComplete = () => {
    setRenderedCount((prevCount) => {
      const newCount = prevCount + 1
      if (newCount === totalItems) {
        setIntialAnimationDone(true)
      }
      return newCount
    })
  }

  const generateGroupColor = (index: number): string => {
    const colors = [
      "drop-shadow-[0px_0px_2px_rgba(59,130,246,1)]", // blue
      "drop-shadow-[0px_0px_2px_rgba(16,185,129,1)]", // green
      "drop-shadow-[0px_0px_2px_rgba(168,85,247,1)]", // purple
      "drop-shadow-[0px_0px_2px_rgba(249,115,22,1)]", // orange
      "drop-shadow-[0px_0px_2px_rgba(236,72,153,1)]", // pink
      "drop-shadow-[0px_0px_2px_rgba(20,184,166,1)]", // teal
      "drop-shadow-[0px_0px_2px_rgba(239,68,68,1)]", // red
      "drop-shadow-[0px_0px_2px_rgba(234,179,8,1)]", // yellow
      "drop-shadow-[0px_0px_2px_rgba(99,102,241,1)]", // indigo
    ]

    // Cycle through colors if we have more groups than colors
    return colors[index % colors.length]
  }

  const renderObject = (obj: Record<string, string>, depth = 0, path = "") => {
    type GetPackageWords = (pkg: string) => string[]

    const getPackageWords: GetPackageWords = (pkg) => {
      const pkgName = pkg.replace(/@[^/]+\//, "")
      return pkgName.split(/[-_]/).filter(Boolean)
    }

    // Modified to find common words across packages
    const findCommonWords = (packages: string[]): Record<string, string[]> => {
      const wordGroups: Record<string, string[]> = {}

      packages.forEach((pkg) => {
        const words = getPackageWords(pkg)
        words.forEach((word) => {
          if (!wordGroups[word]) {
            wordGroups[word] = []
          }
          wordGroups[word].push(pkg)
        })
      })

      // Only keep groups with multiple packages
      return Object.fromEntries(
        Object.entries(wordGroups).filter(
          ([_, packages]) => packages.length > 1
        )
      )
    }

    // Generate colors for word groups
    const wordGroups = findCommonWords(Object.keys(obj))
    const groupColors = Object.keys(wordGroups).reduce((acc, word, index) => {
      acc[word] = generateGroupColor(index)
      return acc
    }, {} as Record<string, string>)

    // Helper function to determine package color based on its words
    const getPackageColor = (key: string): string => {
      const words = getPackageWords(key)
      const matchingWord = words.find((word: string) => wordGroups[word])
      return matchingWord ? groupColors[matchingWord] : ""
    }

    // Modified isPackageGrouped to check for common words
    const isPackageGrouped = (key: string): boolean => {
      if (!intialAnimationDone) return false
      const words = getPackageWords(key)
      return words.some((word) => wordGroups[word])
    }

    return Object.entries(obj).map(([key, value], index) => {
      const currentPath = path ? `${path}.${key}` : key

      if (!currentPaths.includes(currentPath)) {
        setCurrentPaths((prev) => [...prev, currentPath])
      }

      const isGrouped = isPackageGrouped(key)
      const groupColor = isGrouped ? getPackageColor(key) : ""
      const isHighlighted = highlightedItems.has(currentPath)

      // Update background classes to make highlighting more visible
      const backgroundClass = `${groupColor} ${
        isHighlighted ? "bg-primary/20" : ""
      }`.trim()

      return (
        <motion.div
          key={key}
          initial={{ opacity: 0, x: -20 }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            delay: index * getAnimationDelay(obj),
            duration: 0.1,
          }}
          onAnimationComplete={handleAnimationComplete}
          style={{ marginLeft: depth * 20 }}
          className={`text-xs rounded-sm text-white transition-colors duration-100 font-mono`}
        >
          {typeof value === "object" ? (
            <div className="flex flex-col border-primary/20 rounded-md">
              <span className="font-bold">{`"${key}": {`}</span>
              <div>{renderObject(value, depth + 1, currentPath)}</div>
              {`}`}
            </div>
          ) : (
            <span
              className={`font-light ${backgroundClass} ${
                isHighlighted ? "opacity-100" : "opacity-50"
              }`}
            >
              {`"${key}": ${value},`}
            </span>
          )}
        </motion.div>
      )
    })
  }

  if (!fileData) return null

  return (
    <Card className="bg-zinc-800 p-4">
      <CardHeader>
        <CardTitle className="text-white">{filename}</CardTitle>
      </CardHeader>
      <CardContent>{renderObject(fileData)}</CardContent>
    </Card>
  )
}

export default CodeParser
