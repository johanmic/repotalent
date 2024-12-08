"use client"

import { useState, useEffect } from "react"

import { Check, ChevronsUpDown } from "lucide-react"
import { getCities, City } from "@/app/actions/city"
import { useDebounce } from "@uidotdev/usehooks"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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

const CitySelector = ({
  defaultValue,
  defaultCity,
  className,
  onSelect,
}: {
  defaultValue?: string
  defaultCity?: { name: string; country?: { name: string } }
  className?: string
  onSelect: ({ id, name }: { id: string; name: string }) => void
}) => {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(defaultValue || "")
  const [cities, setCities] = useState<City[]>([])
  const [search, setSearch] = useState("")
  const [selectedCity, setSelectedCity] = useState(defaultCity)

  const debouncedSearch = useDebounce(search, 500)
  useEffect(() => {
    console.log(debouncedSearch)
    if (debouncedSearch?.length > 2) {
      getCities(debouncedSearch).then(setCities)
    }
  }, [debouncedSearch])

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full"
          >
            {value && selectedCity
              ? `${selectedCity.name}${
                  selectedCity.country ? `, ${selectedCity.country.name}` : ""
                }`
              : "Search city..."}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 bg-blue-200">
          <Command>
            <CommandInput
              placeholder="Search framework..."
              className="h-9 w-full"
              value={search}
              onValueChange={(value) => setSearch(value)}
            />
            <CommandList className="w-full overflow-y-auto">
              <CommandEmpty>No city found.</CommandEmpty>
              <CommandGroup>
                {cities.map((city) => (
                  <CommandItem
                    key={city.id}
                    value={city.name}
                    onSelect={(currentValue) => {
                      console.log(currentValue)
                      onSelect({ id: city.id, name: currentValue })
                      setValue(currentValue === value ? "" : currentValue)
                      setOpen(false)
                    }}
                  >
                    <span className="text-sm">{city.name},</span>
                    <span className="text-xs text-muted-foreground">
                      {city.country.name}
                    </span>
                    <Check
                      className={cn(
                        "ml-auto",
                        value === city.name ? "opacity-100" : "opacity-0"
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
  )
}

export default CitySelector
