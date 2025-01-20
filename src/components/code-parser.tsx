"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { useEffect, useMemo, useState } from "react"
// import parsePipRequirementsFile from "pip-requirements-js"
import parsePipRequirementsFile from "@/utils/parseRequirementsTXT"
import { parsePodfileLock } from "@/utils/podfileLockParser"
import { parsePyprojectToml } from "@/utils/pyprojectTomlParser"
import { AcceptedFileName } from "@/utils/filenames"
import { CodeParserProgress } from "@/components/code-parser-progress"
import { parsePubspecYaml } from "@/utils/parsePubspecYaml"
interface CodeParserProps {
  data?: string
  filename?: AcceptedFileName
}

function parsePackageJson(file: string): { [key: string]: string } {
  return JSON.parse(file)
}

function parseRequirementsTxt(file: string): { [key: string]: string } {
  const reuslts = parsePipRequirementsFile(file)
  return reuslts
}

const parsePodfile = (file: string): { [key: string]: string } => {
  const reuslts = parsePodfileLock(file)
  return reuslts
}

const getFileData = (
  data: string,
  filename: AcceptedFileName
): { [key: string]: string } | null => {
  switch (filename) {
    case "package.json":
      return parsePackageJson(data)
    case "requirements.txt":
      return parseRequirementsTxt(data)
    case "Podfile.lock":
      return parsePodfile(data)
    case "pyproject.toml":
      return parsePyprojectToml(data)
    case "pubspec.yaml":
      return parsePubspecYaml(data)
    default:
      return null
  }
}

const CodeParser = ({ data, filename = "package.json" }: CodeParserProps) => {
  const [intialAnimationDone, setIntialAnimationDone] = useState(false)
  const [highlightedItems, setHighlightedItems] = useState<Set<string>>(
    new Set()
  )
  const [currentPaths, setCurrentPaths] = useState<string[]>([])

  const fileData = useMemo(() => {
    if (!data) return null
    try {
      return getFileData(data, filename)
    } catch (error) {
      console.error("Error parsing file:", error)
      return null
    }
  }, [data, filename])

  useEffect(() => {
    if (fileData && intialAnimationDone && currentPaths.length > 0) {
      const highlightItems = () => {
        currentPaths.forEach((path, index) => {
          setTimeout(() => {
            setHighlightedItems((prev) => new Set([...prev, path]))
          }, index * (Object.keys(fileData).length > 20 ? 100 : 200))
        })
      }

      highlightItems()
    }
  }, [intialAnimationDone, currentPaths, fileData])

  if (!fileData) return null

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

  const calculateTotalItems = (obj: Record<string, string>): number => {
    if (!obj) return 0
    return Object.values(obj).reduce((count, value) => {
      if (typeof value === "object" && value !== null) {
        return count + calculateTotalItems(value)
      }
      return count + 1
    }, 0)
  }

  // const totalItems = calculateTotalItems(fileData)

  const handleAnimationComplete = () => {
    setIntialAnimationDone(true)
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
        Object.entries(wordGroups).filter(([, packages]) => packages.length > 1)
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

  return (
    <div className="space-y-4 max-w-screen overflow-x-hidden">
      <CodeParserProgress packages={fileData} filename={filename} />
      <Card className="bg-zinc-800 p-4 min-h-[500px]">
        <CardHeader>
          <CardTitle className="text-white">{filename}</CardTitle>
        </CardHeader>
        <CardContent>{renderObject(fileData)}</CardContent>
      </Card>
    </div>
  )
}

export default CodeParser
