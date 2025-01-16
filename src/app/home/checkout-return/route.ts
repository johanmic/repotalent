"use server"
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { addCredits } from "@actions/credits"

const apiKey = process.env.STRIPE_SECRET_KEY
if (!apiKey) {
  throw new Error("Stripe API key is not set in environment variables")
}

const stripe = new Stripe(apiKey)

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const stripeSessionId = searchParams.get("session_id")

    if (!stripeSessionId) {
      return NextResponse.redirect(new URL("/home", request.url))
    }

    const session = await stripe.checkout.sessions.retrieve(stripeSessionId)
    // if (!session) {
    //   return NextResponse.redirect(new URL("/home", request.url))
    // }

    if (session.status === "complete" && session.id) {
      if (session.mode === "payment") {
        const productId = session.metadata?.productId

        if (productId) {
          const purchase = await addCredits({
            productId: productId,
            stripeId: session.id,
            idType: "purchaseId",
            jobBoard: false,
          })
          if (purchase) {
            return NextResponse.redirect(
              new URL(
                "/home/checkout/success?purchaseId=" + purchase.id,
                request.url
              )
            )
          }
        }
        // await addCredits({ stripePurchaseId: session.id })
        return NextResponse.redirect(
          new URL("/home/checkout/success", request.url)
        )
      } else if (session.mode === "subscription") {
        const subscriptionId = session.subscription
        return NextResponse.redirect(
          new URL(
            "/home/checkout/success?subscriptionId=" + subscriptionId,
            request.url
          )
        )
      }
    }

    if (session.status === "open") {
      return NextResponse.redirect(new URL("/home/purchase", request.url))
    }

    // // Default fallback
    // return NextResponse.redirect(new URL("/home/purchase", request.url))
  } catch (error) {
    console.error("Checkout return error:", error)
    return NextResponse.redirect(new URL("/home/purchase", request.url))
  }
}
