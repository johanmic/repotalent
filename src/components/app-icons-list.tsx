"use client"
import AppIcon, { AppIcons } from "@/components/appIcon"
import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { uniqBy, identity } from "ramda"
const iconKeys = Object.keys(AppIcons)
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
function AppIconsList({
  items,
  maxItems,
  href,
}: {
  items: string[]
  maxItems?: number
  href?: string
}) {
  if (!items) return null
  const [showAll, setShowAll] = useState(false)
  const processedItems = useMemo(() => {
    const out = items
      ?.map((item) => {
        const formattedItem = item.toLowerCase().replace(/\./g, "")
        const keyExists = iconKeys.includes(formattedItem)
        if (keyExists) return formattedItem
        const withDots = item.toLowerCase().replace(/\./g, "")
        if (iconKeys.includes(withDots)) return withDots
        return null
      })
      .filter(Boolean) as string[]
    return uniqBy((item) => item.toLowerCase(), out)
  }, [items])

  const displayedItems = maxItems
    ? showAll
      ? processedItems
      : processedItems.slice(0, maxItems)
    : processedItems
  const extraCount = maxItems ? processedItems.length - maxItems : 0

  const out = (
    <motion.div className="flex flex-wrap gap-2 my-2">
      {displayedItems.map((item, index) => (
        <motion.div
          key={item}
          className="flex items-center gap-2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: index * 0.04,
          }}
        >
          <AppIcon name={item as keyof typeof AppIcons} />
          <span className="text-xs">{item}</span>
        </motion.div>
      ))}
      {!showAll && extraCount > 0 && (
        <Badge variant="outline" onClick={() => setShowAll(!showAll)}>
          {`+${extraCount}`}
        </Badge>
      )}
    </motion.div>
  )
  if (href) {
    return <Link href={href}>{out}</Link>
  }
  return out
}

export default AppIconsList
