"use client"

import { CheckoutForm } from "@/components/checkout"
import { Icon } from "@/components/icon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { CheckCircle2 } from "lucide-react"
import { useCallback, useState } from "react"
import { Text } from "@/components/text"
import { Title } from "@/components/title"
type PricingSwitchProps = {
  onSwitch: (value: string) => void
}

type PricingCardProps = {
  isYearly?: boolean
  title: string
  stripePriceId: string
  annualStripePriceId?: string
  monthlyPrice?: number
  yearlyPrice?: number
  price?: number
  description: string
  features: string[]
  actionLabel: string
  popular?: boolean
  exclusive?: boolean
  onSelect: (x: PricingCardProps) => void
}

const PricingHeader = ({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) => (
  <section className="text-center flex flex-col gap-2 items-center">
    <Title size="3xl" className=" font-bold">
      {title}
    </Title>
    <Text className="text-xl pt-1">{subtitle}</Text>
    <br />
  </section>
)

const PricingSwitch = ({ onSwitch }: PricingSwitchProps) => (
  <Tabs defaultValue="0" className="w-40 mx-auto" onValueChange={onSwitch}>
    <TabsList className="py-6 px-2">
      <TabsTrigger value="0" className="text-base">
        Monthly
      </TabsTrigger>
      <TabsTrigger value="1" className="text-base">
        Yearly
      </TabsTrigger>
    </TabsList>
  </Tabs>
)

const PricingCard = (props: PricingCardProps) => {
  const {
    isYearly,
    title,
    monthlyPrice,
    yearlyPrice,
    price,
    description,
    features,
    actionLabel,
    popular,
    exclusive,
    onSelect,
  } = props
  return (
    <Card
      className={cn(
        `w-72 flex flex-col justify-between py-1 ${
          popular ? "border-primary" : "border-secondary"
        } mx-auto sm:mx-0`,
        {
          "animate-background-shine bg-background dark:bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] transition-colors":
            exclusive,
        }
      )}
    >
      <div>
        <CardHeader className="pb-8 pt-4">
          {isYearly && yearlyPrice && monthlyPrice ? (
            <div className="flex justify-between">
              <CardTitle className="dark:text-secondary-dark text-lg">
                {title}
              </CardTitle>
              <Badge className="text-sm animate-fade-in">
                Save ${monthlyPrice * 12 - yearlyPrice}
              </Badge>
            </div>
          ) : (
            <Text as="h2" className="text-lg">
              {title}
            </Text>
          )}
          <div className="flex gap-0.5">
            <h3 className="text-3xl font-black">
              {price
                ? "$" + price
                : yearlyPrice && isYearly
                ? "$" + yearlyPrice
                : monthlyPrice
                ? "$" + monthlyPrice
                : null}
            </h3>
            <span className="flex flex-col justify-end text-sm mb-1">
              {yearlyPrice && isYearly
                ? "/year"
                : monthlyPrice
                ? "/month"
                : null}
            </span>
          </div>
          <CardDescription className="pt-1.5 h-12">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {features.map((feature: string) => (
            <CheckItem key={feature} text={feature} />
          ))}
        </CardContent>
      </div>
      <CardFooter className="mt-2">
        <Button onClick={() => onSelect(props)} className="w-full">
          {actionLabel}
        </Button>
      </CardFooter>
    </Card>
  )
}

const CheckItem = ({ text }: { text: string }) => (
  <div className="flex gap-2">
    <CheckCircle2 size={18} className="my-auto" />
    <p className="pt-0.5 text-sm">{text}</p>
  </div>
)

export const Pricing = ({ mode }: { mode: "landing" | "purchase" }) => {
  const [isYearly, setIsYearly] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PricingCardProps | null>(
    null
  )
  const togglePricingPeriod = (value: string) =>
    setIsYearly(parseInt(value) === 1)
  const handleSelectPlan = useCallback((plan: PricingCardProps) => {
    setSelectedPlan(plan)
    setDialogOpen(true)
  }, [])
  const plans = [
    {
      title: "One Off",
      price: 5,
      stripePriceId: "prod_RNuDvKogVwr2P1",
      description: "Dedicated support and infrastructure to fit your needs",
      features: [
        "Generate 1 Job Description",
        "No Job Board Hosting",
        "Export to Markdown",
      ],
      actionLabel: "Get Started",
      exclusive: true,
      recurring: false,
    },
    {
      title: "Basic",
      stripePriceId: "prod_RNu45yVmDQ4HJq",
      monthlyPrice: 10,
      yearlyPrice: 100,
      description: "Essential features you need to get started",
      features: [
        "Generate 1 Job Description",
        "1 Month of job board ",
        "Unlimited edits and upgrades",
        "Export to Markdown",
      ],
      actionLabel: "Get Started",
      recurring: true,
    },
    {
      title: "Pro",
      stripePriceId: "prod_RNu59hKXDKjvtt",
      monthlyPrice: 25,
      yearlyPrice: 250,
      description: "Perfect for multiple roles",
      features: [
        "Generate 3 Job Descriptions",
        "3 Months of job board",
        "Unlimited edits and upgrades",
        "Export to Markdown",
      ],
      actionLabel: "Get Started",
      recurring: true,
    },
  ]

  if (selectedPlan && dialogOpen) {
    return (
      <div>
        <div className="flex justify-start pl-2">
          <div
            className="flex items-start gap-2 cursor-pointer"
            onClick={() => setDialogOpen(false)}
          >
            <Icon name="moveLeft" />
            <p>Back</p>
          </div>
        </div>
        <CheckoutForm productId={selectedPlan?.stripePriceId || ""} />
      </div>
    )
  }

  return (
    <div className="py-8" id="pricing">
      <PricingHeader
        title="Pricing Plans"
        subtitle="Choose the plan that's right for you"
      />
      <PricingSwitch onSwitch={togglePricingPeriod} />
      <section className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-8 mt-8">
        {plans.map((plan) => {
          return (
            <PricingCard
              key={plan.title}
              {...plan}
              isYearly={isYearly}
              onSelect={mode === "purchase" ? handleSelectPlan : () => {}}
            />
          )
        })}
      </section>
    </div>
  )
}
