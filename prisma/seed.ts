import { PrismaClient } from "@prisma/client"
import { getCountryData, TCountryCode } from "countries-list"
import cities from "../assets/cities500.json" assert { type: "json" }
import { splitEvery } from "ramda"

import { raw } from "@/utils/diacritics"
const schema = "public"
const prisma = new PrismaClient()

// Define an interface for the city data
interface City {
  name: string
  country: string
  pop: string
  lon: string
  lat: string
}

// Cast cities to the correct type
const citiesData: City[] = cities as City[]

// Define TCountryCode if not imported
// type TCountryCode = string // Adjust this based on your actual country code type

const generateExtensions = (): string[] => {
  // Replace this with your actual SQL generation logic
  return [
    "CREATE EXTENSION IF NOT EXISTS postgis;",
    "CREATE EXTENSION IF NOT EXISTS pg_trgm;",
    `ALTER TABLE IF EXISTS "city" ADD COLUMN IF NOT EXISTS location "geography"(Point, 4326);`,
    `ALTER TABLE IF EXISTS "venue" ADD COLUMN IF NOT EXISTS location "geography"(Point, 4326);`,
    // Add more SQL statements as needed
  ]
}

const importCountriesData = async () => {
  const countries = new Set(citiesData.map((city) => city.country))
  const mappedCountries = Array.from(countries)
    .filter((a2) => a2 !== "RU") // Filter out Russia
    .map((a2) => ({
      a2,
      data: getCountryData(a2 as TCountryCode),
    }))

  // Create continents
  const continents = new Set(
    mappedCountries.map((country) => country.data.continent)
  )
  await prisma.continent.createMany({
    data: Array.from(continents).map((code) => ({
      code,
      name: getFullContinentName(code),
    })),
    skipDuplicates: true,
  })

  // Create currencies (normalized)
  const currencies = new Set(
    mappedCountries.flatMap((country) => country.data.currency)
  )
  for (const code of currencies) {
    await prisma.currency.upsert({
      where: { code },
      create: { code },
      update: {},
    })
  }

  // Create languages (normalized)
  const languages = new Set(
    mappedCountries.flatMap((country) => country.data.languages)
  )
  for (const code of languages) {
    await prisma.language.upsert({
      where: { code },
      create: { code },
      update: {},
    })
  }

  // Create countries and their relations
  for (const country of mappedCountries) {
    const { a2, data } = country
    await prisma.country.upsert({
      where: { a2 },
      update: {},
      create: {
        a2,
        name: data.name,
        nativeName: data.native,
        capital: data.capital,
        continent: { connect: { code: data.continent } },
        currencies: {
          create: data.currency.map((code) => ({
            currency: { connect: { code } },
          })),
        },
        languages: {
          create: data.languages.map((code) => ({
            language: { connect: { code } },
          })),
        },
        phoneCodes: {
          create: data.phone.map((code) => ({
            code: code, // Assuming phone codes should be strings
          })),
        },
      },
    })
  }
}

const importCities = async () => {
  const chunks = splitEvery(500, citiesData)
  const totalChunks = chunks.length

  // Fetch all countries and create a mapping
  const countries = await prisma.country.findMany({
    select: { id: true, a2: true },
  })
  const countryMap = new Map(countries.map((c) => [c.a2, c.id]))

  // await prisma.city.deleteMany({})

  for (const [index, chunk] of chunks.entries()) {
    const validCities = chunk.filter((city) => {
      const rawName = raw(city.name)
      return rawName && city.country && countryMap.has(city.country)
    })

    const cityData = validCities.map((city) => ({
      name: city.name,
      raw: raw(city.name),
      countryId: countryMap.get(city.country)!,
      population: parseInt(city.pop, 10),
    }))

    try {
      await prisma.$transaction(
        async (tx) => {
          // Bulk insert cities
          await tx.city.createMany({
            data: cityData,
            skipDuplicates: true,
          })

          // Update locations for created cities
          for (const city of validCities) {
            await tx.$executeRawUnsafe(
              `
              UPDATE "${schema}"."city" AS c
              SET location = ST_SetSRID(ST_MakePoint($1, $2), 4326)
              WHERE c.location IS NULL
                AND c.name = $3
                AND c."countryId" = $4
            `,
              parseFloat(city.lon),
              parseFloat(city.lat),
              city.name,
              countryMap.get(city.country)
            )
          }
        },
        {
          maxWait: 5000,
          timeout: 90000,
        }
      )
    } catch (error) {
      console.error(`Error processing chunk ${index + 1}:`, error)
      // Optionally, you can choose to throw the error to stop the process
      // throw error;
    }
  }
}

function getFullContinentName(code: string): string {
  const continentMap: { [key: string]: string } = {
    AF: "Africa",
    AN: "Antarctica",
    AS: "Asia",
    EU: "Europe",
    NA: "North America",
    OC: "Oceania",
    SA: "South America",
  }
  return continentMap[code] || code
}

const plans = [
  {
    title: "One Off",
    price: 5,
    stripePriceId: "prod_RUsy3vFHbGQBVF",
    description: "One quick, custom job.",
    features: ["Create 1 job description", "Export to Markdown & PDF"],
    actionLabel: "Get Started",
    exclusive: true,
    recurring: false,
    tokens: 1,
  },
  {
    title: "Basic",
    stripePriceId: "prod_RUsz5HhIxLzwxM",
    price: 10,
    yearlyPrice: 100,
    description: "Core essentials for job posting.",
    features: [
      "Create 1 job description",
      "1-month job board listing",
      "Unlimited edits",
      "Export to Markdown",
    ],
    actionLabel: "Get Started",
    recurring: true,
    tokens: 1,
  },
  {
    title: "Pro",
    stripePriceId: "prod_RUszn4ryzRPb5Y",
    price: 25,
    yearlyPrice: 250,
    description: "Ideal for multiple hires.",
    features: [
      "Create 3 job descriptions",
      "3-month job board listing",
      "Unlimited edits",
      "Export to Markdown",
    ],
    actionLabel: "Get Started",
    recurring: true,
    tokens: 3,
  },
]

export const seedProducts = async () => {
  await Promise.all(
    plans.map(async (plan) => {
      await prisma.product.create({
        data: {
          title: plan.title,
          price: plan.price,
          yearlyPrice: plan.yearlyPrice,
          description: plan.description,
          recurring: plan.recurring,
          credits: plan.tokens,
          stripeId: plan.stripePriceId,
          features: {
            create: plan.features.map((feature) => ({
              feature,
            })),
          },
        },
      })
    })
  )
}

export const seedPromoCodes = async () => {
  await prisma.promoCode.create({
    data: {
      code: "BEACHBOD25",
      credits: 25,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      limit: 10,
    },
  })
}

async function main() {
  await generateExtensions()
  await importCountriesData()
  await importCities()
  await seedProducts()
  await seedPromoCodes()
}

main()
