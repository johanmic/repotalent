"use client"

import { listPublishedJobs, searchJobs, JobPost } from "@actions/jobpost"
import { JobPostListItem } from "@/components/job-post-list-item"
import { JobsMenu } from "@/components/jobs-menu"
import { useDebounce } from "@/hooks/use-debounce"
import { useState, useEffect } from "react"
import { Text } from "@/components/text"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/icon"

export default function JobsPage({
  publishedJobs,
}: {
  publishedJobs: JobPost[]
}) {
  const [searchQuery, setSearchQuery] = useState<string | null>(null)
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  const [searchResults, setSearchResults] = useState<JobPost[]>([])
  useEffect(() => {
    const fetchSearchResults = async () => {
      const results = await searchJobs({
        query: debouncedSearchQuery as string,
      })
      setSearchResults(results)
    }
    if (debouncedSearchQuery && debouncedSearchQuery?.length > 2) {
      fetchSearchResults()
    }
  }, [debouncedSearchQuery])
  return (
    <div className="w-full">
      <div className="max-w-5xl mx-auto">
        <JobsMenu onSearch={setSearchQuery} searchQuery={searchQuery} />
        {searchQuery ? (
          <div className="flex flex-col gap-2 mx-auto">
            <div className="flex justify-between bg-white/10 border border-muted  p-4 rounded-md max-w-xl items-center w-full mx-auto">
              <Text>Search: {searchQuery}</Text>
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear <Icon name="x" />
              </Button>
            </div>
            {searchResults.map((job) => (
              <JobPostListItem key={job.id} job={job} />
            ))}
          </div>
        ) : (
          publishedJobs.map((job) => <JobPostListItem key={job.id} job={job} />)
        )}
      </div>
    </div>
  )
}
