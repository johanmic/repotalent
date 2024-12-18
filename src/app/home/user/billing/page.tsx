import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/icon"
import { PromoCode } from "@/components/promo-code"
import { getUserUsageStats } from "@actions/credits"
import { getUserSubscription } from "@actions/subscriptions"
import { getUser } from "@actions/user"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import dayjs from "dayjs"
import { Subscription } from "./Subscription"

const ProfilePage = async () => {
  const user = await getUser()
  const { purchases, creditUsage } = await getUserUsageStats()
  const subscription = await getUserSubscription()

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4">
      <h1 className="text-3xl font-bold">Billing</h1>

      <Card>
        <CardHeader>
          <CardTitle>Purchases</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea className="h-[300px] pr-4">
            {purchases.map((purchase) => (
              <div
                key={purchase.id}
                className="flex items-center justify-between border-b py-3 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <Icon name="coins" className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">
                    +{purchase.product?.credits ?? purchase.promoCode?.credits}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span>{dayjs(purchase.createdAt).format("MM/DD/YYYY")}</span>
                  {purchase.promoCodeId ? (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Icon name="tag" className="h-3 w-3" />
                      {purchase.promoCode?.code || "N/A"}
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      {purchase.idType === "invoiceId" ? (
                        "Subscription"
                      ) : (
                        <div className="flex items-center gap-2">
                          <Icon name="creditCard" className="h-3 w-3" />
                          One time purchase
                        </div>
                      )}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            {creditUsage?.length > 0 ? (
              <div className="space-y-3">
                {creditUsage.map((usage) => (
                  <div
                    key={usage.id}
                    className="flex items-center gap-3 border-b py-2 last:border-0"
                  >
                    <Icon name="coins" className="h-4 w-4 text-red-500" />
                    <span className="font-medium">-1</span>
                    <span className="text-sm text-muted-foreground">
                      {usage.jobPost.title}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm italic text-muted-foreground">
                No usage yet
              </p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Subscription subscription={Object.assign({}, subscription)} />

      <Card>
        <CardContent className="pt-6">
          <PromoCode />
        </CardContent>
      </Card>
    </div>
  )
}

export default ProfilePage
