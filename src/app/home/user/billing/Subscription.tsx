"use client"
import { Icon } from "@/components/icon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import dayjs from "dayjs"
import type { Stripe } from "stripe"
import Link from "next/link"
export const Subscription = ({
  subscription,
}: {
  subscription: Stripe.Subscription
}) => {
  const isActive = subscription?.status === "active"
  const nextBilling = subscription?.current_period_end
    ? dayjs(subscription.current_period_end).format("MMMM D, YYYY")
    : null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Manage your subscription plan</CardDescription>
          </div>
          {isActive && (
            <Badge variant="outline" className="flex items-center gap-2">
              <Icon name="check" className="h-3 w-3 text-green-500" />
              Active
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {subscription && subscription?.items?.data?.length > 0 ? (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Plan</span>
                <span className="font-medium">
                  {subscription?.items?.data?.[0].price.nickname ||
                    "Basic Plan"}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Billing Period
                </span>
                <span className="font-medium">Monthly</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Next Billing
                </span>
                <span className="font-medium">{nextBilling || "N/A"}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              {isActive ? (
                <>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Icon name="refresh" className="h-4 w-4" />
                    Change Plan
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    <Icon name="x" className="h-4 w-4" />
                    Cancel Subscription
                  </Button>
                </>
              ) : (
                <Button className="flex items-center gap-2">
                  <Icon name="plus" className="h-4 w-4" />
                  Subscribe Now
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Icon
              name="package"
              className="mb-4 h-12 w-12 text-muted-foreground/50"
            />
            <h3 className="mb-2 text-lg font-medium">No Active Subscription</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Subscribe to a plan to get access to premium features
            </p>
            <Link href="/home/purchase">
              <Button className="flex items-center gap-2">
                <Icon name="plus" className="h-4 w-4" />
                Get Started
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
