"use client"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import Link from "next/link"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { login, verifyOTP } from "./actions"

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  otp: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

const LoginForm = () => {
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [email, setEmail] = useState("")

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      otp: "",
    },
  })

  const onSubmitEmail = async (data: FormValues) => {
    const formData = new FormData()
    formData.append("email", data.email)

    const res = await login(formData)
    if (res.error) {
      toast.error(res.error.message)
    } else {
      setEmail(data.email)
      setIsOtpSent(true)
    }
  }

  const onSubmitOTP = async (value: string) => {
    const formData = new FormData()
    formData.append("email", email)
    formData.append("otp", value)

    await verifyOTP(formData)
  }

  return (
    <motion.div
      className="w-full flex flex-col gap-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {!isOtpSent ? (
        <Form {...form}>
          <motion.form
            onSubmit={form.handleSubmit(onSubmitEmail)}
            className="space-y-6 gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="example@example.com" {...field} />
                  </FormControl>
                  {/* <FormDescription>
                    Enter your email to receive an OTP.
                  </FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Send OTP
            </Button>
          </motion.form>
        </Form>
      ) : (
        <motion.div
          className="space-y-4 flex flex-col items-center w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-lg font-semibold text-center">
            Enter verification code
          </h2>
          <InputOTP maxLength={6} onComplete={onSubmitOTP}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSeparator />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </motion.div>
      )}
      <div className="flex flex-row text-center gap-1 justify-center text-xs text-muted-foreground">
        By signing up you agree to our{" "}
        <Link className="underline underline-offset-4" href="/legal/tos">
          Terms of Service
        </Link>{" "}
        and
        <Link className="underline underline-offset-4" href="/legal/privacy">
          Privacy Policy
        </Link>
      </div>
    </motion.div>
  )
}

export default LoginForm
