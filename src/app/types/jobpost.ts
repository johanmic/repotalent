import {
  city,
  country,
  currency,
  jobPost,
  jobPostQuestion,
  jobPostRatings,
  jobPostTag,
  openSourcePackage,
  openSourcePackageVersion,
  organization,
  creditUsage,
  purchase,
} from "@prisma/client"

export interface JobPostToPackageVersion {
  package: openSourcePackage
  packageVersion: openSourcePackageVersion
}

export interface JobPost extends jobPost {
  tags?: { tag: jobPostTag }[]
  questions?: jobPostQuestion[]
  ratings?: jobPostRatings[]
  currency?: currency
  packages?: {
    packageVersion?: {
      package: openSourcePackage
      version: string
    }
  }[]
  organization?: organization & {
    city: city & {
      country: country
    }
  }
  creditUsage?:
    | (creditUsage & {
        purchase?: purchase | null
      })[]
    | null
}
