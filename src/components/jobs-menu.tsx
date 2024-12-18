"use client"
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input"
export const JobsMenu = ({
  onSearch,
  searchQuery,
}: {
  onSearch: (query: string) => void
  searchQuery: string | null
}) => {
  return (
    <div className="flex flex-col gap-2 my-8">
      <PlaceholdersAndVanishInput
        value={searchQuery || ""}
        placeholders={[
          "npm package",
          "front end developer",
          "location",
          "programming language",
          "dev stack",
        ]}
        onChange={(e) => {
          onSearch(e.target.value)
        }}
        onSubmit={(e) => {
          e.preventDefault()
          if (e.target instanceof HTMLInputElement) {
            onSearch(e.target.value)
          }
        }}
      />
    </div>
  )
}
