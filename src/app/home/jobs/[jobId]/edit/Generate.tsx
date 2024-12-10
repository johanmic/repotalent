"use client"

import Icon from "@/components/icon"
import { Button } from "@/components/ui/button"
import { JobPost } from "@actions/jobpost"
import { writeJobDescription } from "@actions/write"
import { updateJobPost } from "@actions/jobpost"
import { readStreamableValue } from "ai/rsc"
import { useCallback, useState } from "react"
import { TextEditor } from "@/components/text-editor"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import * as zod from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

const schema = zod.object({
  title: zod.string().min(5),
  description: zod.string().min(5),
  tags: zod.array(zod.string()),
  minSalary: zod.number().min(0),
  maxSalary: zod.number().min(0),
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
    tags: job?.tags?.map((tag) => tag.tag.tag) || [],
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
const EditJobPost = ({ job }: { job: JobPost }) => {
  const form = useForm<zod.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: mapJobPostToForm(job),
  })

  const jobId = job.id
  const [description, setDescription] = useState("")
  const [generation, setGeneration] = useState<string>("")

  const [isLoading, setIsLoading] = useState(false)

  const handleWrite = useCallback(async () => {
    try {
      setIsLoading(true)
      setGeneration("")

      const { output } = await writeJobDescription({
        jobId: jobId as string,
      })

      for await (const delta of readStreamableValue(output)) {
        setGeneration((currentGeneration) => `${currentGeneration}${delta}`)
      }
    } catch (error) {
      console.error("Error writing job description:", error)
    } finally {
      setIsLoading(false)
    }
  }, [jobId])

  const updateJob = useCallback(async () => {
    console.log("Job description saved:", generation)
    // await updateJobPost({
    //   jobId: jobId as string,
    //   data: {
    //     description: generation,
    //   },
    // })
  }, [generation, jobId])
  return (
    <div className="p-4 space-y-4 mb-48 max-w-6xl">
      <Form {...form}>
        <form
          className="space-y-6 w-full"
          onSubmit={form.handleSubmit(updateJob)}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="mt-8 col-span-2">
              <TextEditor
                className="max-w-2xl"
                markdown={generation}
                onChange={(value) => {
                  console.log(value)
                }}
              />
            </div>
            <div>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input {...field} className="text-[24px] font-bold" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
              <div className="grid grid-cols-1 gap-2">
                <div className="col-span-2 flex flex-col gap-2">
                  <FormField
                    control={form.control}
                    name="minSalary"
                    render={({ field }) => (
                      <FormItem className="flex flex-col space-y-2">
                        <FormLabel>Minimum Salary</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="input input-bordered w-full"
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Enter minimum salary"
                          />
                        </FormControl>
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
                            type="number"
                            className="input input-bordered w-full"
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Enter maximum salary"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex flex-col justify-between items-end flex-wrap">
                  <FormField
                    control={form.control}
                    name="remote"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-4">
                        <FormLabel className="mt-2">Remote Work</FormLabel>
                        <FormControl>
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
                      <FormItem className="flex flex-row items-center space-x-4">
                        <FormLabel className="mt-2">Hybrid Work</FormLabel>
                        <FormControl>
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
                      <FormItem className="flex flex-row items-center space-x-4">
                        <FormLabel className="mt-2">
                          Consulting Position
                        </FormLabel>
                        <FormControl>
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
                      <FormItem className="flex flex-row items-center space-x-4">
                        <FormLabel className="mt-2">
                          Open Source Project
                        </FormLabel>
                        <FormControl>
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
                      <FormItem className="flex flex-row items-center space-x-4">
                        <FormLabel className="mt-2">Equity</FormLabel>
                        <FormControl>
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
            </div>
          </div>

          <div className="fixed bottom-0 right-0 left-0 md:ml-48 flex justify-center items-center gap-2 p-4 bg-sidebar-accent border  ">
            {
              <Button
                onClick={handleWrite}
                disabled={isLoading}
                className="btn btn-primary"
              >
                {isLoading ? <Icon name="spinner" /> : <Icon name="rotate" />}
                {isLoading ? "Writing..." : "Rewrite Description"}
              </Button>
            }

            <Button
              role="submit"
              className="btn btn-secondary"
              disabled={!generation || isLoading}
            >
              Save Description
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default EditJobPost
