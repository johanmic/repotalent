"use client"

import Icon from "@/components/icon"
import { TextEditor } from "@/components/text-editor"
import { Title } from "@/components/title"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { generateJSONFromMarkdown } from "@/utils/tiptapUtils"
import { JobPost, updateJobPost } from "@actions/jobpost"
import { writeJobDescription } from "@actions/write"
import { zodResolver } from "@hookform/resolvers/zod"
import { readStreamableValue } from "ai/rsc"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as zod from "zod"
import { useRouter } from "next/navigation"
import { CurrencySelector } from "@/components/currency-selector"
import { Currency } from "@/app/actions/city"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
const tagSchema = zod.object({
  tag: zod.string(),
  id: zod.string(),
  createdAt: zod.date(),
  updatedAt: zod.date(),
})
const currencySchema = zod.object({
  id: zod.string(),
  code: zod.string(),
  countries: zod
    .array(
      zod.object({
        countryId: zod.string(),
        currencyCode: zod.string(),
        country: zod.object({
          id: zod.string(),
          name: zod.string(),
          // ... other fields can be optional
        }),
      })
    )
    .optional(),
})
const schema = zod.object({
  title: zod.string().min(5),
  description: zod.string().min(5),
  currency: currencySchema,
  //   tags: zod.array(tagSchema),
  minSalary: zod.number().nullable().optional(),
  maxSalary: zod.number().nullable().optional(),
  type: zod.string(),
  experience: zod.string(),
  remote: zod.boolean(),
  hybrid: zod.boolean(),
  openSource: zod.boolean(),
  consulting: zod.boolean(),
  additionalInfo: zod.string(),
  equity: zod.boolean(),
  applicationUrl: zod.string().url().optional().nullable(),
})

const mapJobPostToForm = (job: JobPost) => {
  return {
    title: job.title || "",
    description: job.description || "",
    minSalary: job.minSalary || 0,
    maxSalary: job.maxSalary || 0,
    openSource: job.openSource || false,
    type: job.type || "full time",
    experience: job.experience || "",
    currency: job.currency
      ? {
          id: job.currency.id,
          code: job.currency.code,
          countries: [],
        }
      : undefined,
    // tags:
    //   job?.tags?.map((tag) => ({
    //     tag: {
    //       id: tag.tag.id,
    //       createdAt: tag.tag.createdAt,
    //       updatedAt: tag.tag.updatedAt,
    //       tag: tag.tag.tag,
    //       default: tag.tag.default || false,
    //     },
    //   })) || [],
    remote: job.remote || false,
    hybrid: job.hybrid || false,
    consulting: job.consulting || false,
    additionalInfo: job.additionalInfo || "",
    equity: job.equity || false,
    applicationUrl: job.applicationUrl,
  }
}
// import { MarkdownEditor } from "@/components/markdown-editor"
// Allow streaming responses up to 30 seconds
export const maxDuration = 30
const formatNumberInput = (value: number | undefined | null): string => {
  if (!value) return ""
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 })
}

const parseFormattedNumber = (value: string): number | null => {
  if (!value) return null
  // Remove all commas before parsing
  const cleanValue = value.replace(/,/g, "")
  const parsed = Number(cleanValue)
  return isNaN(parsed) ? null : parsed
}

interface FormErrors {
  [key: string]: boolean
}

const EditJobPost = ({
  job,
  currencies,
}: {
  job: JobPost
  currencies: Currency[]
}) => {
  const form = useForm<zod.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: mapJobPostToForm(job),
  })
  const router = useRouter()

  const jobId = job.id
  const [generation, setGeneration] = useState<string>("")
  const [additionalInfo, setAdditionalInfo] = useState<string>(
    job.additionalInfo || ""
  )
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleRewriteClick = () => {
    setIsModalOpen(true)
  }

  const handleModalSubmit = async () => {
    setIsModalOpen(false)
    await handleWrite()
  }

  const onStreamingDone = useCallback(
    async (fullValue: string) => {
      const json = await generateJSONFromMarkdown(fullValue)
      toast.success("Generated")

      await updateJobPost({
        jobId: jobId as string,
        data: { description: JSON.stringify(json) },
        shouldRedirect: false,
      })
    },
    [generation]
  )
  const handleWrite = useCallback(async () => {
    try {
      setIsLoading(true)
      setGeneration("")

      const { output } = await writeJobDescription({
        jobId: jobId as string,
        additionalInfo,
      })
      let out = ``
      for await (const delta of readStreamableValue(output)) {
        out += delta
        setGeneration(out)
      }

      if (out) {
        await onStreamingDone(out)
      }
    } catch (error) {
      console.error("Error writing job description:", error)
    } finally {
      setIsLoading(false)
    }
  }, [jobId, onStreamingDone, additionalInfo])

  useEffect(() => {
    if (job && !job.description) {
      handleWrite()
    }
  }, [job])

  const [formErrors, setFormErrors] = useState<FormErrors>({})

  const updateJob = useCallback(
    async (data: zod.infer<typeof schema>) => {
      try {
        setFormErrors({})
        await updateJobPost({
          jobId: jobId as string,
          data: data as Partial<JobPost>,
          shouldRedirect: false,
        })
        toast.success("Job description saved")
        // router.push(`/home/jobs/${jobId}/preview`)
      } catch (error) {
        toast.error("Failed to save job post")
        // Highlight fields with errors
        const errorFields = Object.keys(form.formState.errors)
        const newErrors = errorFields.reduce(
          (acc, field) => ({
            ...acc,
            [field]: true,
          }),
          {}
        )
        setFormErrors(newErrors)
      }
    },
    [generation, jobId, router, form.formState.errors]
  )
  return (
    <div className="p-4 space-y-4 mb-48 max-w-6xl">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <Title>Complete the Job Post</Title>
          <p className="text-sm text-gray-500">
            Edit the job post to make it more attractive to candidates.
          </p>
        </div>

        <Link href={`/home/jobs/${jobId}/preview`}>
          <Button variant="outline" size="sm" asChild>
            <div>
              <Icon name="preview" />
              Preview
            </div>
          </Button>
        </Link>
      </div>
      <Form {...form}>
        <form
          className="space-y-6 w-full"
          onSubmit={form.handleSubmit(updateJob, (errors) => {
            toast.error("Please fix the validation errors", {
              description: Object.keys(errors)
                .map((key) => errors[key as keyof typeof errors]?.message)
                .join(", "),
            })
            // Convert errors to FormErrors format
            const newErrors = Object.keys(errors).reduce(
              (acc, key) => ({
                ...acc,
                [key]: true,
              }),
              {} as FormErrors
            )
            setFormErrors(newErrors)
          })}
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={formErrors.title ? "text-error" : ""}>
                  Job Title
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className={`font-bold text-xl ${
                      formErrors.title ? "border-error focus:border-error" : ""
                    }`}
                  />
                </FormControl>
                <FormMessage className="text-error text-sm" />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="mt-8 col-span-2 order-1 md:order-2">
              <TextEditor
                className="max-w-2xl"
                markdown={generation}
                description={job.description}
                onChange={(value) => {
                  if (value) {
                    form.setValue("description", JSON.stringify(value))
                  }
                }}
              />
            </div>
            <div className="col-span-1 order-2 gap-2 flex flex-col md:order-1">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employment Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="full time">Full Time</SelectItem>
                        <SelectItem value="part time">Part Time</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="applicationUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application URL</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div>
                <FormLabel className={formErrors.currency ? "text-error" : ""}>
                  Currency
                </FormLabel>
                <CurrencySelector
                  currencies={currencies}
                  defaultCurrency={form.getValues("currency")?.code}
                  onSelect={(currency) => {
                    form.setValue("currency", {
                      id: currency.id,
                      code: currency.code,
                    })
                    // Clear currency error when valid selection is made
                    if (formErrors.currency) {
                      setFormErrors((prev) => ({ ...prev, currency: false }))
                    }
                  }}
                  className={formErrors.currency ? "border-destructive" : ""}
                />
                {formErrors.currency && (
                  <p className="text-destructive text-sm mt-1">
                    Please select a currency
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-2">
                <div className="col-span-2 flex flex-col gap-2">
                  <FormField
                    control={form.control}
                    name="minSalary"
                    render={({ field }) => (
                      <FormItem className="flex flex-col space-y-2 pt-2">
                        <FormLabel>Minimum Salary</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            className={`input input-bordered w-full ${
                              formErrors.minSalary ||
                              form.formState.errors.minSalary
                                ? "border-error focus:border-error"
                                : ""
                            }`}
                            value={
                              field.value ? formatNumberInput(field.value) : ""
                            }
                            onChange={(e) => {
                              const rawValue = e.target.value.replace(
                                /[^\d,]/g,
                                ""
                              )
                              field.onChange(parseFormattedNumber(rawValue))
                            }}
                            placeholder="Enter minimum salary"
                          />
                        </FormControl>
                        <FormMessage className="text-error text-sm" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxSalary"
                    render={({ field }) => (
                      <FormItem className="flex flex-col space-y-2">
                        <FormLabel>Maximum Salary</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            className="input input-bordered w-full"
                            value={
                              field.value ? formatNumberInput(field.value) : ""
                            }
                            onChange={(e) => {
                              const rawValue = e.target.value.replace(
                                /[^\d,]/g,
                                ""
                              )
                              field.onChange(parseFormattedNumber(rawValue))
                            }}
                            placeholder="Enter maximum salary"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex flex-col gap-2 justify-between items-start flex-wrap">
                  <FormField
                    control={form.control}
                    name="remote"
                    render={({ field }) => (
                      <FormItem className="flex  w-full flex-row justify-between items-center gap-2">
                        <div className="max-w-64">
                          <FormLabel>Remote Work</FormLabel>
                          <FormDescription>
                            Remote work is a great way to work from anywhere in
                            the world.
                          </FormDescription>
                        </div>
                        <FormControl className="mt-2">
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hybrid"
                    render={({ field }) => (
                      <FormItem className="flex  w-full flex-row justify-between items-center gap-2">
                        <div className="max-w-64">
                          <FormLabel className="mt-0">Hybrid Work</FormLabel>
                          <FormDescription>
                            Hybrid work is a great way to work from anywhere in
                            the world.
                          </FormDescription>
                        </div>
                        <FormControl className="mt-2">
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="consulting"
                    render={({ field }) => (
                      <FormItem className="flex  w-full flex-row justify-between items-center gap-2">
                        <div className="max-w-64">
                          <FormLabel className="mt-0">
                            Consulting Position
                          </FormLabel>
                          <FormDescription>
                            Consulting positions are great for people who want
                            to work from anywhere in the world.
                          </FormDescription>
                        </div>
                        <FormControl className="mt-2">
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="openSource"
                    render={({ field }) => (
                      <FormItem className="flex  w-full flex-row justify-between items-center gap-2">
                        <div className="max-w-64">
                          <FormLabel className="mt-0">
                            Open Source Project
                          </FormLabel>
                          <FormDescription>
                            Is the project open source? some developers value
                            this.
                          </FormDescription>
                        </div>
                        <FormControl className="mt-2">
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="equity"
                    render={({ field }) => (
                      <FormItem className="flex  w-full flex-row justify-between items-center gap-2">
                        <div className="max-w-64">
                          <FormLabel className="mt-0">Equity</FormLabel>
                          <FormDescription>
                            Equity is a great way to work from anywhere in the
                            world.
                          </FormDescription>
                        </div>
                        <FormControl className="mt-2">
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="hidden md:flex flex-wrap flex-row gap-2 justify-start my-4 items-center">
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <Link href={`/home/jobs/${jobId}/complete`}>
                    <Button
                      role="submit"
                      className="btn btn-secondary"
                      variant="ghost"
                      disabled={isLoading}
                      size="sm"
                    >
                      <Icon name="fileSliders" />
                      Edit Questions
                    </Button>
                  </Link>
                  <DialogTrigger asChild>
                    <Button
                      onClick={handleRewriteClick}
                      disabled={isLoading}
                      className="btn btn-primary"
                      size="sm"
                      variant={job.description ? "ghost" : "default"}
                    >
                      {isLoading ? (
                        <Icon name="spinner" />
                      ) : (
                        <Icon name="rotate" />
                      )}
                      {isLoading ? "Writing..." : "Rewrite"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Rewrite Job Description</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-warning text-xs font-light">
                        Warning: This will remove edits to the job description.
                      </p>
                      <textarea
                        className="w-full p-2 border rounded"
                        value={additionalInfo}
                        onChange={(e) => setAdditionalInfo(e.target.value)}
                        placeholder="Enter additional information"
                      />
                      <Button
                        onClick={handleModalSubmit}
                        className="btn btn-primary"
                      >
                        Submit
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  role="submit"
                  className="btn btn-secondary"
                  disabled={isLoading}
                  size="sm"
                >
                  <Icon name="save" />
                  Save
                </Button>
              </div>
            </div>
          </div>

          <div className="md:hidden fixed bottom-0 right-0 left-0 md:ml-48 flex justify-center items-center gap-2 p-4 bg-sidebar-accent border  ">
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={handleRewriteClick}
                  disabled={isLoading}
                  variant={job.description ? "outline" : "default"}
                  className="btn btn-primary"
                >
                  {isLoading ? <Icon name="spinner" /> : <Icon name="rotate" />}
                  {isLoading ? "Writing..." : "Rewrite"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rewrite Job Description</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-warning text-xs font-light">
                    Warning: This will remove all previous data.
                  </p>
                  <textarea
                    className="w-full p-2 border rounded"
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    placeholder="Enter additional information"
                  />
                  <Button
                    onClick={handleModalSubmit}
                    className="btn btn-primary"
                  >
                    Submit
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              role="submit"
              className="btn btn-secondary"
              disabled={isLoading}
            >
              <Icon name="save" />
              Save Description
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default EditJobPost
