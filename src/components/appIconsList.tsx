import AppIcon, { AppIcons } from "@/components/appIcon"

import { motion } from "framer-motion"

const iconKeys = Object.keys(AppIcons)

function AppIconsList({ items }: { items: string[] }) {
  if (!items) return null
  console.log("items", items)
  const processedItems = items
    ?.map((item) => {
      const formattedItem = item.toLowerCase().replace(/\./g, "")
      const keyExists = iconKeys.includes(formattedItem)
      if (keyExists) return formattedItem
      const withDots = item.toLowerCase().replace(/\./g, "")
      if (iconKeys.includes(withDots)) return withDots
      return null
    })
    .filter(Boolean) as string[]

  console.log(processedItems)

  return (
    <motion.div className="flex flex-wrap gap-2 my-2">
      {processedItems.map((item, index) => (
        <motion.div
          key={item}
          className="flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, delay: index * 0.3 }}
        >
          <AppIcon name={item as keyof typeof AppIcons} />
          <span className="text-xs">{item}</span>
        </motion.div>
      ))}
    </motion.div>
  )
}

export default AppIconsList
