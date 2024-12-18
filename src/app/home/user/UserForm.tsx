"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { User, updateUser } from "@actions/user"
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
  name: z.string().min(3),
  avatar: z.string().url(),
  bio: z.string().min(10).nullable().optional(),
})
const UserForm = ({ user }: { user: User }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name ?? "",
      avatar: user.avatar ?? "",
      bio: user.bio ?? "",
    },
  })

  const onUpdate = async (data: z.infer<typeof formSchema>) => {
    await updateUser(user.id, data)
  }

  return (
    <div>
      <form
        onSubmit={form.handleSubmit(onUpdate)}
        className="flex flex-col gap-4"
      >
        <Input name="name" placeholder="Jon Doe" />
        <Textarea
          name="bio"
          value={form.getValues("bio") as string}
          placeholder="Bio"
          className="h-24"
          onChange={(e) => form.setValue("bio", e.target.value)}
        />
        <Button type="submit">Save</Button>
      </form>
    </div>
  )
}

export default UserForm
