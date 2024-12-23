"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { GithubOrg } from "@/app/actions/github"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createOrganization } from "@actions/org"
import Icon from "@/components/appIcon"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
export default function GithubOrgPicker({ orgs }: { orgs: GithubOrg[] }) {
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSelect = async (org: GithubOrg) => {
    try {
      setIsLoading(true)
      setSelectedOrg(org.login)

      await createOrganization({
        image: org.avatar_url || null,
        name: org.login || "",
        website: org.url || "",
        description: org.description || null,
        contact: null,
        facebook: null,
        twitter: null,
        instagram: null,
        linkedin: null,
      })

      toast.success("Organization created")

      await router.refresh()

      await new Promise((resolve) => setTimeout(resolve, 500))

      router.push("/home/org")
    } catch (error) {
      toast.error("Failed to create organization")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2 bg-muted/50 p-4 rounded-lg">
      <div className="text-sm font-medium flex items-center gap-2">
        <Icon name="github" /> Use a Github organization
      </div>
      <div className="flex flex-row gap-2 my-4">
        <AnimatePresence>
          {orgs.map((org, index) => (
            <motion.div
              key={org.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                delay: index * 0.1,
                duration: 0.2,
              }}
              className={`
                flex items-center gap-2 border py-2 px-4 
                hover:opacity-50 rounded-lg justify-between
                ${
                  isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                }
                transition-colors duration-200
                ${selectedOrg === org.login ? "border-primary border-2" : ""}
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => !isLoading && handleSelect(org)}
            >
              <Avatar>
                <AvatarImage src={org.avatar_url || ""} />
                <AvatarFallback>{org.name?.slice(0, 2) || ""}</AvatarFallback>
              </Avatar>
              <div className="text-sm">{org.login}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
