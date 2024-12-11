"use client"

import { useEffect, useState } from "react"

import { Currency } from "@/app/actions/city"
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
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown } from "lucide-react"

export const CurrencySelector = ({
  currencies,
  onSelect,
  defaultCurrency,
  className,
}: {
  currencies: Currency[]
  onSelect: (currency: Currency) => void
  defaultCurrency: string
  className?: string
}) => {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const [search, setSearch] = useState("")
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>()

  useEffect(() => {
    const currency = currencies.find((c) => c.code === defaultCurrency)
    setSelectedCurrency(currency ?? null)
  }, [defaultCurrency, currencies])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full", className)}
        >
          {selectedCurrency ? `${selectedCurrency.code}` : "Select currency..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command className="w-full">
          <CommandInput
            placeholder="Search currency..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No currency found.</CommandEmpty>
            <CommandGroup>
              {currencies.map((currency) => (
                <CommandItem
                  key={currency.code}
                  value={currency.code}
                  onSelect={() => {
                    onSelect(currency)
                    setSelectedCurrency(currency)
                    setValue(currency.code)
                    setOpen(false)
                  }}
                >
                  <span className="flex items-center">
                    <span>{currency.code}</span>
                  </span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {currency.countries.map((c) => c.country.name).join(", ")}
                  </span>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === currency.code ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
