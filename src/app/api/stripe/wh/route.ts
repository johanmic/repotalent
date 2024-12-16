// app/api/webhooks/route.ts

import Stripe from "stripe"
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)
import { handleSubscriptionChange } from "@actions/subscriptions"
import { addSubscriptionCredits } from "@actions/stripe"
const subscriptionEvents = new Set([
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
])

const paymentEvents = new Set([
  "customer.invoice.payment_succeeded",
  //   "payment_intent.succeeded",
  //   "payment_intent.payment_failed",
])

export async function POST(req: Request) {
  try {
    const bodyBuffer = await req.arrayBuffer()
    const signature = req.headers.get("stripe-signature")
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string

    if (!signature) {
      return Response.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      )
    }

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(
        Buffer.from(bodyBuffer),
        signature,
        webhookSecret
      )
    } catch (error) {
      console.error("Webhook signature verification failed:", error)
      return Response.json(
        {
          error: "Webhook signature verification failed",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 400 }
      )
    }

    if (subscriptionEvents.has(event.type)) {
      try {
        await handleSubscriptionChange(event)
      } catch (error) {
        console.error("Subscription webhook handler failed:", error)
        return Response.json(
          {
            error: "Subscription webhook handler failed",
            message: error instanceof Error ? error.message : "Unknown error",
          },
          { status: 500 }
        )
      }
    }

    if (paymentEvents.has(event.type)) {
      try {
        await addSubscriptionCredits(event)
      } catch (error) {
        console.error("Payment webhook handler failed:", error)
      }
    }

    return Response.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error("Unexpected webhook error:", error)
    return Response.json(
      {
        error: "Unexpected webhook error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
