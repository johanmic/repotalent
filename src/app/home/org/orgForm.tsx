"use client"

import { createOrganization, updateOrganization, Organization } from "./actions"
import AppIcon from "@/components/appIcon"
import CitySelector from "@/components/city-selector"
import Icon from "@/components/icon"
import { ImageUpload } from "@/components/image-upload"
import { Button } from "@/components/ui/button"
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

const citySchema = z.object({
  id: z.string(),
  name: z.string(),
})

export const schema = z.object({
  id: z.string().optional(),
  name: z.string().min(5),
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
      city:
        { name: organization?.city?.name, id: organization?.city?.id } || null,
    },
  })

  const onSubmit = useCallback(
    async (data: z.infer<typeof schema>) => {
      console.log(data)
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
    ? getImageUrl(organization?.image || "")
    : null
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.log(errors)
        })}
        className="space-y-6 w-full "
      >
        <div className="grid md:grid-cols-3 gap-4">
          <div className="gap-2 flex flex-col items-center justify-center">
            <ImageUpload
              image={imageUrl}
              onUpload={(path) => {
                console.log("path", path)
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
