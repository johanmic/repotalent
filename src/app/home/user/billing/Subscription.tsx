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
import Link from "next/link"
import type { Stripe } from "stripe"

export interface Subscription extends Stripe.Subscription {
  plan: Stripe.Plan
}

export const Subscription = ({
  subscription,
}: {
  subscription: Subscription
}) => {
  console.log(subscription)
  const isActive = subscription?.status === "active"
  const nextBilling = subscription?.current_period_end
    ? new Date(subscription.current_period_end * 1000).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      )
    : null

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toLowerCase(),
    }).format(amount / 100)
  }

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
                  {subscription?.plan?.nickname || "Premium Plan"}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Price</span>
                <span className="font-medium">
                  {subscription?.plan?.amount && subscription?.plan?.currency
                    ? formatPrice(
                        subscription.plan.amount,
                        subscription.plan.currency
                      )
                    : "N/A"}
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
