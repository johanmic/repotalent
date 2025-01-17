"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { SlidersHorizontal } from "lucide-react"
import { Dispatch, SetStateAction, useCallback } from "react"
// Export the interface so it can be shared
import { FilterOptions } from "@/app/actions/leads"
import { JobPost } from "@/app/actions/jobpost"
import { Check, ChevronsUpDown } from "lucide-react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface FilterFormProps {
  options: FilterOptions
  onOptionsChange: Dispatch<SetStateAction<FilterOptions>>
  maxFollowers: number
  job: JobPost
}

export const FilterForm = ({
  job,
  options,
  onOptionsChange,
  maxFollowers,
}: FilterFormProps) => {
  const handleInputChange = useCallback(
    (field: keyof FilterOptions, value: any) => {
      onOptionsChange((prev) => ({
        ...prev,
        [field]: value,
      }))
    },
    [onOptionsChange]
  )
  console.log(job)
  return (
    <Collapsible className="w-full border-none">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full flex gap-2 max-w-32"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filter Leads
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <Card className="w-full mt-2">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hireable"
                    checked={options.hireable || false}
                    onCheckedChange={(checked) =>
                      handleInputChange("hireable", checked)
                    }
                  />
                  <Label htmlFor="hireable">Hireable</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="starred"
                    checked={options.starred || false}
                    onCheckedChange={(checked) =>
                      handleInputChange("starred", checked)
                    }
                  />
                  <Label htmlFor="starred">Starred</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="faang"
                    checked={options.faang || false}
                    onCheckedChange={(checked) =>
                      handleInputChange("faang", checked)
                    }
                  />
                  <Label htmlFor="faang">FAANG</Label>
                </div>
                <div className="space-y-2">
                  <Label>Followers</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={options.minFollowers || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "minFollowers",
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={options.maxFollowers || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "maxFollowers",
                          parseInt(e.target.value) || maxFollowers
                        )
                      }
                    />
                  </div>
                </div>
              </div>
              <div>
                <div className="space-y-2">
                  <Label>Contributions</Label>
                  <Slider
                    min={0}
                    max={5000}
                    step={50}
                    value={[options.minContributions || 0]}
                    onValueChange={([value]) => {
                      handleInputChange("minContributions", value)
                    }}
                  />
                  <div className="text-xs text-muted-foreground">
                    {options.minContributions || 0}+
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    placeholder="Enter location"
                    value={options.location || ""}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Required Packages</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                      >
                        {options.repoIds?.length
                          ? `${options.repoIds.length} packages selected`
                          : "Select packages..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                      <Command>
                        <CommandInput placeholder="Search packages..." />
                        <CommandList>
                          <CommandEmpty>No packages found.</CommandEmpty>
                          <CommandGroup>
                            {job?.packages?.map((pkg) => (
                              <CommandItem
                                key={pkg?.packageVersion?.package?.id}
                                onSelect={() => {
                                  const packageId =
                                    pkg?.packageVersion?.package?.githubRepo?.id
                                  handleInputChange(
                                    "repoIds",
                                    options.repoIds?.includes(packageId || "")
                                      ? options.repoIds.filter(
                                          (id) => id !== packageId
                                        )
                                      : [...(options.repoIds || []), packageId]
                                  )
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  {pkg?.packageVersion?.package?.githubRepo
                                    ?.logo && (
                                    <img
                                      src={
                                        pkg?.packageVersion?.package?.githubRepo
                                          ?.logo
                                      }
                                      alt={pkg?.packageVersion?.package?.name}
                                      className="w-6 h-6 rounded-full"
                                    />
                                  )}
                                  <span>
                                    {pkg?.packageVersion?.package?.name}
                                  </span>
                                </div>
                                <Check
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    options.repoIds?.includes(
                                      pkg?.packageVersion?.package?.id || ""
                                    )
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  )
}
