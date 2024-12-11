"use server"

import prisma from "@/store/prisma"
import { remove as diacritics } from "diacritics"
import { raw } from "@/utils/deburr"
import { city, country, currency } from "@prisma/client"
import { uniqBy } from "ramda"
export type City = city & { country: country }
import { getUser } from "@/utils/supabase/server"
export type Currency = currency & {
  countries: {
    countryId: string
    currencyCode: string
    country: country
  }[]
}

export const getCities = async (name: string): Promise<City[]> => {
  if (!name || (name && name.length <= 2)) {
    throw new Error("query too short")
  }
  const user = await getUser()
  if (!user) {
    throw new Error("user not found")
  }

  const cleanName = diacritics(name).toLowerCase().trim()
  console.log(cleanName)
  const [exact, cities] = await Promise.all([
    prisma.city.findMany({
      where: {
        raw: cleanName,
      },
      include: {
        country: true,
      },
      orderBy: {
        population: "desc",
      },
    }),
    prisma.city.findMany({
      where: {
        raw: {
          contains: raw(cleanName),
        },
      },
      take: 100,
      include: {
        country: true,
      },
      orderBy: {
        population: "desc",
      },
    }),
  ])
  console.log(exact, cities)
  return uniqBy((city: City) => city.id, [...exact, ...cities])
}

export const getCity = async (id: string): Promise<City | null> => {
  const user = await getUser()
  if (!user) {
    throw new Error("user not found")
  }
  const city = await prisma.city.findUnique({
    where: {
      id,
    },
    include: {
      country: true,
    },
  })
  return city
}

export const getCurrencies = async (): Promise<Currency[]> => {
  const user = await getUser()
  if (!user) throw new Error("user not found")

  return prisma.currency.findMany({
    include: {
      countries: {
        include: {
          country: true,
        },
      },
    },
  })
}
