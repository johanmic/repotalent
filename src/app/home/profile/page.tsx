import { getUser, updateUser } from "@actions/user"
import { User } from "@actions/user"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import UserForm from "./UserForm"
import { Icon } from "@/components/icon"
import dayjs from "dayjs"
import { getUserUsageStats } from "@actions/credits"
import { Title } from "@/components/title"
import { PromoCode } from "@/components/promo-code"
import { getUserSubscription } from "@actions/subscriptions"
import { Subscription } from "./Subscription"

const ProfilePage = async () => {
  const user = await getUser()
  const { purchases, creditUsage } = await getUserUsageStats()
  const subscription = await getUserSubscription()

  return (
    <div className="mx-auto max-w-xl">
      <Title size="xl">Profile</Title>
      <div className="flex flex-col gap-4">
        <UserForm user={user} />
      </div>
      <div className="flex flex-col gap-4 bg-muted p-4 rounded-md mt-4">
        <Title>Purchases</Title>
        {purchases.map((purchase) => (
          <div key={purchase.id} className="flex flex-row gap-2 items-center">
            <div className="flex items-center gap-2">
              <Icon name="coins" className="w-4 h-4" />
              <span className="text-sm font-bold">
                +{purchase.product?.credits ?? purchase.promoCode?.credits}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              {dayjs(purchase.createdAt).format("MM/DD/YYYY")}
            </div>
            <div className="text-sm text-muted-foreground">
              {purchase.promoCodeId ? (
                <div className="flex flex-row gap-2 items-center">
                  Promo Code:
                  <Icon name="tag" className="w-4 h-4" />
                  <span className="text-sm font-bold text-muted-foreground">
                    {purchase.promoCode?.code || "N/A"}
                  </span>
                </div>
              ) : (
                <div className="flex flex-row gap-2 items-center">
                  {purchase.idType === "invoiceId" ? (
                    "Subscription"
                  ) : (
                    <div className="flex flex-row gap-2 items-center">
                      <Icon name="creditCard" className="w-4 h-4" />
                      <span className="text-sm font-bold text-muted-foreground">
                        One time purchase
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-4 bg-muted p-4 mt-4 rounded-md">
        <Title>Usage</Title>
        {creditUsage?.length > 0 ? (
          creditUsage.map((usage) => (
            <div key={usage.id}>
              <p>{usage.jobPostId}</p>
              <p>{usage.tokensUsed}</p>
            </div>
          ))
        ) : (
          <div className="text-sm italic text-muted-foreground">
            No usage yet
          </div>
        )}
      </div>
      <Subscription subscription={Object.assign({}, subscription)} />
      <div>
        <PromoCode />
      </div>
    </div>
  )
}

export default ProfilePage
