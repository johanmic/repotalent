"use server"

import { schema } from "@/components/organization-form"
import prisma from "@/store/prisma"
import { getUser } from "@/utils/supabase/server"
import { city, country, organization } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { omit } from "ramda"
import { z } from "zod"
type OrganizationForm = z.infer<typeof schema>

export interface Organization extends organization {
  city: city & {
    country: country
  }
}
export const getOrganization = async (): Promise<Organization> => {
  const { user } = await getUser()
  if (!user) {
    redirect("/login")
  }
  const organization = await prisma.organization.findFirst({
    where: { users: { some: { id: user.id } } },
    include: {
      city: {
        include: {
          country: true,
        },
      },
    },
  })
  return organization as Organization
}

export const createOrganization = async (data: OrganizationForm) => {
  const { user } = await getUser()
  if (!user) {
    redirect("/login")
  }
  const organization = await prisma.organization.create({
    data: {
      ...omit(["city", "id"], data),
      city: data.city ? { connect: { id: data.city.id } } : undefined,
      users: { connect: { id: user.id } },
    },
  })
  revalidatePath("/home", "layout")
  revalidatePath("/home/org", "layout")
  return organization as Organization
}

export const updateOrganization = async (data: OrganizationForm) => {
  const { user } = await getUser()
  if (!user) {
    redirect("/login")
  }

  if (!data.id) {
    throw new Error("Organization ID is required for updates")
  }

  const organization = await prisma.organization.update({
    where: { id: data.id },
    data: {
      ...omit(["city", "id"], data),
      city: data.city ? { connect: { id: data.city.id } } : undefined,
      users: { connect: { id: user.id } },
    },
    include: {
      city: {
        include: {
          country: true,
        },
      },
    },
  })
  revalidatePath("/home", "layout")
  return organization as Organization
}
