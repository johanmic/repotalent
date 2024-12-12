"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { PromoCode } from "@/components/promo-code"
import { User } from "@actions/user"
const formSchema = z.object({
  name: z.string().min(3),
  avatar: z.string().url(),
})
const UserForm = ({ user }: { user: User }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: user.name, avatar: user.avatar },
  })

  const updateUser = async (data: z.infer<typeof formSchema>) => {
    await updateUser(user.id, data)
  }

  return (
    <div>
      <form>
        <Input name="name" placeholder="Name" />
        <Input name="avatar" placeholder="Avatar" />
        <Button type="submit">Save</Button>
      </form>
      <div>
        <PromoCode />
      </div>
    </div>
  )
}

export default UserForm
