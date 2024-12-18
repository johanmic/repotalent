"use server"

import { getUser } from "@/utils/supabase/server"
import prisma from "@/store/prisma"
import { organization, city, country } from "@prisma/client"
import { redirect } from "next/navigation"
import { schema } from "@/components/organization-form"
import { z } from "zod"
import { omit } from "ramda"
type OrganizationForm = z.infer<typeof schema>
import { revalidatePath } from "next/cache"

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
      city: { connect: { id: data.city.id } },
      users: { connect: { id: user.id } },
    },
  })
  revalidatePath("/home", "layout")
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
      city: { connect: { id: data.city.id } },
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
