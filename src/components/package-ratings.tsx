"use client"

import {
  getJobPackages,
  JobPackageToVersion,
  updatePackageRatings,
} from "@/app/actions/jobpost"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { Spinner } from "@/components/ui/spinner"
import { Sparkles } from "lucide-react"
import { useEffect, useState } from "react"
import * as zod from "zod"
import { getRatingLabel } from "@/utils/packageRatingsMapper"
export const schema = zod.object({
  importance: zod.number().min(1).max(10),
  jobPostId: zod.string(),
  packageVersionId: zod.string(),
  packageVersion: zod.object({
    id: zod.string(),
    package: zod.object({
      id: zod.string(),
      githubRepo: zod
        .object({
          id: zod.string(),
        })
        .optional()
        .nullable(),
    }),
  }),
})

type PackageRatingsForm = zod.infer<typeof schema>

interface PackageRating {
  packageVersionId: string
  importance: number
}

export const PackageRatings = ({ jobPostId }: { jobPostId: string }) => {
  const [packages, setPackages] = useState<JobPackageToVersion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const fetchPackages = async () => {
        const packages = await getJobPackages(jobPostId)
        console.log("packages", packages)
        setPackages(packages)
        setRatings(
          Object.fromEntries(packages.map((pkg) => [pkg.packageVersionId, 0]))
        )
      }
      fetchPackages()
    }
  }, [jobPostId, isOpen])
  const handleRatingChange = (pkg: JobPackageToVersion, value: number[]) => {
    const newValue = value[0]
    setRatings((prev) => ({
      ...prev,
      [pkg.packageVersionId]: newValue,
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const ratingsToUpdate = packages
        .filter((pkg) => ratings[pkg.packageVersionId] >= 5)
        .map((pkg) => ({
          jobPostId: pkg.jobPostId,
          packageVersionId: pkg.packageVersionId,
          importance: ratings[pkg.packageVersionId],
        }))

      if (ratingsToUpdate.length > 0) {
        await updatePackageRatings(ratingsToUpdate)
      }
      setIsOpen(false)
    } catch (error) {
      console.error("Failed to save ratings:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Button
        role="button"
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.preventDefault()
          setIsOpen(true)
        }}
      >
        <Sparkles className="w-4 h-4 mr-2" /> Rate Packages
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogTitle>Package Importance Ratings</DialogTitle>
          <DialogDescription>
            Adjust the importance of each package for the job post
          </DialogDescription>
          {packages.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <Spinner />
            </div>
          ) : (
            <>
              <div className="space-y-6 overflow-y-auto max-h-[400px]">
                {packages.map((pkg) => {
                  const rating = ratings[pkg.packageVersionId] || pkg.importance
                  const label = getRatingLabel(rating)
                  return (
                    <div key={pkg.packageVersionId} className="space-y-2">
                      <div className="flex justify-start gap-2 items-center">
                        {pkg.packageVersion.package.githubRepo?.logo ? (
                          <img
                            src={pkg.packageVersion.package.githubRepo.logo}
                            alt={pkg.packageVersion.package?.name}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : null}
                        <span className="font-medium">
                          {pkg.packageVersion.package?.name}
                        </span>
                      </div>
                      <span className={`text-xs ${label.color}`}>
                        {label.text}
                      </span>
                      <Slider
                        defaultValue={[pkg.importance || 0]}
                        max={10}
                        min={0}
                        step={2}
                        value={[rating]}
                        onValueChange={(value) =>
                          handleRatingChange(pkg, value)
                        }
                        className="w-full"
                      />
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <Spinner className="mr-2 h-4 w-4" /> : null}
                  {isSaving ? "Saving..." : "Save & Close"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
