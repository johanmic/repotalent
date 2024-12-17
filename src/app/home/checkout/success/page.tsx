import { getPurchase } from "@actions/credits"
import { getUserSubscription } from "@actions/subscriptions"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@components/ui/card"
import { Button } from "@components/ui/button"
import { Icon } from "@components/icon"
import Link from "next/link"

interface SearchParams {
  purchaseId?: string
  subscriptionId?: string
}

const CheckoutSuccessPage = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) => {
  const { purchaseId, subscriptionId } = await searchParams

  if (purchaseId) {
    const purchase = await getPurchase(purchaseId)
    if (!purchase) return <div>Purchase not found</div>

    return (
      <SuccessCard
        title="Purchase Complete"
        description={`You have successfully purchased ${purchase?.product?.credits} credits`}
      />
    )
  }

  if (subscriptionId) {
    const subscription = await getUserSubscription()
    if (!subscription) return <div>Subscription not found</div>

    return (
      <SuccessCard
        title="Subscription Activated"
        description={`Your subscription is now active`}
      />
    )
  }

  return <div>Invalid checkout session</div>
}

interface SuccessCardProps {
  title: string
  description: string
}

const SuccessCard = ({ title, description }: SuccessCardProps) => (
  <div className="flex flex-col items-center justify-center h-screen">
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-2">
            <Icon name="check" /> {title}
          </div>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <Link href="/home/create" className="flex items-center gap-2">
            <Icon name="plus" /> Create a Job Post
          </Link>
        </Button>
      </CardContent>
    </Card>
  </div>
)

export default CheckoutSuccessPage
