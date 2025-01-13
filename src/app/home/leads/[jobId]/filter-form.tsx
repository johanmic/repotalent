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

interface FilterFormProps {
  options: FilterOptions
  onOptionsChange: Dispatch<SetStateAction<FilterOptions>>
  maxFollowers: number
}

export const FilterForm = ({
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="hireable">Starred</Label>
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

              {/* <div className="space-y-2">
                <Label>Ratings</Label>
                <RangeSlider
                  min={0}
                  max={5}
                  step={0.5}
                  value={[options.minRating, options.maxRating]}
                  onValueChange={([min, max]) => {
                    handleInputChange("minRating", min)
                    handleInputChange("maxRating", max)
                  }}
                />
                <div className="text-xs text-muted-foreground">
                  {options.minRating} - {options.maxRating}
                </div>
              </div> */}

              <div className="space-y-2 md:col-span-2">
                <Label>Location</Label>
                <Input
                  placeholder="Enter location"
                  value={options.location || ""}
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  )
}
