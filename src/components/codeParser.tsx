"use client"
import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Icon from "@/components/icon"
interface CodeParserProps {
  data?: string
  fileName?: "package.json" | "requirements.txt"
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

const CodeParser = ({
  data = sampleData,
  fileName = "package.json",
}: CodeParserProps) => {
  const fileData = fileName === "package.json" ? parsePackageJson(data) : null
  const [intialAnimationDone, setIntialAnimationDone] = useState(false)
  const [renderedCount, setRenderedCount] = useState(0)
  const [highlightedItems, setHighlightedItems] = useState<Set<string>>(
    new Set()
  )
  const [currentPaths, setCurrentPaths] = useState<string[]>([])

  useEffect(() => {
    if (intialAnimationDone && currentPaths.length > 0) {
      const highlightItems = () => {
        currentPaths.forEach((path, index) => {
          setTimeout(() => {
            setHighlightedItems((prev) => {
              const newSet = new Set(prev)
              newSet.add(path)
              return newSet
            })
          }, index * 200)
        })
      }

      highlightItems()
    }
  }, [intialAnimationDone, currentPaths])

  const calculateTotalItems = (obj: Record<string, any>): number => {
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
        console.log("Animation completed")
        setIntialAnimationDone(true)
      }
      return newCount
    })
  }

  const renderObject = (obj: Record<string, any>, depth = 0, path = "") => {
    // Helper function to get package base name using regex
    const getPackageBase = (pkg: string): string => {
      const scopedPackageRegex = /@[^/]+\//
      const match = pkg.match(scopedPackageRegex)
      if (match) {
        return match[0]
      }
      return pkg.split("-")[0]
    }

    // Dynamically generate package groups and colors
    const generateGroupColor = (index: number): string => {
      const colors = [
        "text-rose-500",
        "text-pink-500",
        "text-fuchsia-500",
        "text-purple-500",
        "text-violet-500",
      ]
      return colors[index % colors.length]
    }

    // Create dynamic color mapping based on existing package groups
    const groupColors = Object.keys(obj).reduce((acc, key) => {
      const base = getPackageBase(key)
      if (!acc[base]) {
        acc[base] = generateGroupColor(Object.keys(acc).length)
      }
      return acc
    }, {} as Record<string, string>)

    // Helper function to determine if a package is grouped
    const isPackageGrouped = (key: string): boolean => {
      if (!intialAnimationDone) return false
      const base = getPackageBase(key)
      return Object.keys(obj).some(
        (k) => k !== key && getPackageBase(k) === base
      )
    }

    // Helper function to get the appropriate color for a package
    const getGroupColor = (key: string): string => {
      const base = getPackageBase(key)
      return groupColors[base] || "bg-slate-300/10"
    }

    return Object.entries(obj).map(([key, value], index) => {
      const currentPath = path ? `${path}.${key}` : key

      if (!currentPaths.includes(currentPath)) {
        setCurrentPaths((prev) => [...prev, currentPath])
      }

      const isGrouped = isPackageGrouped(key)
      const groupColor = isGrouped ? getGroupColor(key) : ""
      const isHighlighted = highlightedItems.has(currentPath)

      // Combine background colors for both grouping and highlighting
      const backgroundClass = `${groupColor} ${isHighlighted ? "" : ""}`.trim()

      return (
        <motion.div
          key={key}
          initial={{ opacity: 0, x: -20 }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            delay: index * 0.1,
            duration: 0.3,
          }}
          onAnimationComplete={handleAnimationComplete}
          style={{ marginLeft: depth * 20 }}
          className={`text-xs ${backgroundClass} rounded-sm text-white transition-colors duration-300 font-mono`}
        >
          {typeof value === "object" ? (
            <div className="flex flex-col border-primary/20 rounded-md">
              <span className="font-bold">{`"${key}": {`}</span>
              <div>{renderObject(value, depth + 1, currentPath)}</div>
              {`}`}
            </div>
          ) : (
            <span
              className={`font-light ${
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
    <Card className="bg-slate-900 p-4">
      <CardHeader>
        <CardTitle className="text-white">{fileName}</CardTitle>
      </CardHeader>
      <CardContent>{renderObject(fileData)}</CardContent>
    </Card>
  )
}

export default CodeParser
