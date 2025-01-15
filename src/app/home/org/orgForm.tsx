"use client"

import {
  createOrganization,
  updateOrganization,
  Organization,
} from "@actions/org"
import AppIcon from "@/components/appIcon"
import CitySelector from "@/components/city-selector"
import Icon from "@/components/icon"
import { ImageUpload } from "@/components/image-upload"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/text"
import { toast } from "sonner"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCallback } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { getImageUrl } from "@/utils/image"

const citySchema = z
  .object({
    id: z.string({ required_error: "Please select a city" }),
    name: z.string({ required_error: "Please select a city" }),
  })
  .nullable()
  .refine((data) => data !== null, {
    message: "Please select a city",
  })

export const schema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters long"),
  website: z.string().url().nullable().optional(),
  contact: z.string().nullable(),
  city: citySchema,
  image: z.string().nullable(),
  facebook: z.string().url().nullable(),
  twitter: z.string().url().nullable(),
  instagram: z.string().url().nullable(),
  linkedin: z.string().url().nullable(),
  description: z.string().nullable(),
})

const CreateOrgForm = ({
  organization,
}: {
  organization?: Organization | null
}) => {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: organization?.id || "",
      name: organization?.name || "",
      website: organization?.website || null,
      contact: organization?.contact || null,
      image: organization?.image || null,
      facebook: organization?.facebook || null,
      twitter: organization?.twitter || null,
      instagram: organization?.instagram || null,
      linkedin: organization?.linkedin || null,
      description: organization?.description || null,
      city: { name: organization?.city?.name, id: organization?.city?.id },
    },
  })

  const onSubmit = useCallback(
    async (data: z.infer<typeof schema>) => {
      const organizationData = {
        ...data,
        website: data.website || "",
      }
      if (organization) {
        await updateOrganization(organizationData)
        toast.success("Organization updated")
      } else {
        await createOrganization(organizationData)
        toast.success("Organization created")
      }
    },
    [organization]
  )
  const imageUrl = organization?.image
    ? organization?.image.includes("https://")
      ? organization?.image
      : getImageUrl(organization?.image || "")
    : null

  const getFirstError = (errors: object): string => {
    // Recursively search for the first error message
    const findFirstMessage = (obj: any): string | undefined => {
      if (obj?.message) return obj.message // Check for message at current level first

      for (const key in obj) {
        if (obj[key]?.message) {
          return obj[key].message
        }
        if (typeof obj[key] === "object") {
          const message = findFirstMessage(obj[key])
          if (message) return message
        }
      }
    }

    return findFirstMessage(errors) || "Please fill out all required fields"
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          toast.error(getFirstError(errors))
        })}
        className="space-y-6 w-full"
      >
        <div className="grid md:grid-cols-3 gap-4">
          <div className="gap-2 flex flex-col items-center justify-center">
            <ImageUpload
              image={imageUrl}
              onUpload={(path) => {
                form.setValue("image", path)
              }}
            />
          </div>
          <div className="gap-2 flex flex-col md:col-span-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="mb-2">*Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Acme Inc." />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex flex-col">
              <FormLabel className="mb-2">*City</FormLabel>
              <CitySelector
                defaultValue={organization?.city?.name}
                defaultCity={organization?.city}
                className="w-full"
                onSelect={(value) => {
                  form.setValue("city", value)
                }}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="col-span-3">
                <FormLabel className="mb-2">Description</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value ?? ""}
                    placeholder="A brief description of the organization"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          {!form.getValues("description") && (
            <div className="col-span-3 border p-4 rounded-lg border-orange-400">
              <Text className="text-orange-400" variant="sm">
                Adding a good description will help us generate job descriptions
                for this organization.
              </Text>
            </div>
          )}

          <div className="col-span-3"></div>
        </div>

        <Separator />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mb-2 flex items-center gap-2">
                  <Icon className="w-4 h-4" name="globe" />
                  *Website
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="https://example.com"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="instagram"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mb-2 flex items-center gap-2">
                  <AppIcon size={14} name="instagram" /> Instagram
                </FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="facebook"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mb-2 flex items-center gap-2">
                  <AppIcon size={14} name="facebook" /> Facebook
                </FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="linkedin"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mb-2 flex items-center gap-2">
                  <AppIcon size={14} name="linkedin" /> Linkedin
                </FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="mt-4">
          {organization ? "Update" : "Create"}
        </Button>
      </form>
    </Form>
  )
}

export default CreateOrgForm
