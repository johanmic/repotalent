"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Title } from "@/components/title"
import { cancelUserSubscription } from "@actions/subscriptions"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import type { Stripe } from "stripe"
import { Badge } from "@/components/ui/badge"
import { Icon } from "@/components/icon"
import dayjs from "dayjs"

export const Subscription = ({
  subscription,
}: {
  subscription?: Stripe.Response<Stripe.Subscription>
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  if (!subscription || Object.keys(subscription).length === 0) return null

  const amount = subscription?.items?.data?.[0]?.price?.unit_amount || 0
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount / 100)

  const nextBillingDate = dayjs
    .unix(subscription.current_period_end)
    .format("MMMM D, YYYY")

  const handleCancelSubscription = async () => {
    try {
      setIsLoading(true)
      await cancelUserSubscription(subscription.id)
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Failed to cancel subscription:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-2 bg-muted p-4 mt-4 rounded-md">
        <Title>Subscription</Title>
        <div className="flex flex-row gap-2 justify-between">
          <div className="flex flex-col gap-2">
            <div>
              status:{" "}
              <Badge className="bg-teal-400 text-white border-none">
                <Icon name="check" className="w-3 h-3 mr-2" />
                {subscription?.status}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Cost: {formattedAmount}/month</p>
              <p>Next billing date: {nextBillingDate}</p>
            </div>
          </div>
          <div>
            {subscription.status === "active" && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsDialogOpen(true)}
              >
                Cancel Subscription
              </Button>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogTitle>Cancel Subscription</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel your subscription? This action
            cannot be undone.
          </DialogDescription>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsDialogOpen(false)}
              disabled={isLoading}
            >
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={isLoading}
            >
              {isLoading ? "Canceling..." : "Yes, Cancel Subscription"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
