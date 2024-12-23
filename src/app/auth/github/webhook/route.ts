"use server"
import prisma from "@/store/prisma"
import { InstallationEvent } from "@octokit/webhooks-types"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
// Verify the webhook signature from GitHub
function verifyGitHubWebhook(payload: string, signature: string): boolean {
  const crypto = require("crypto")
  const secret = process.env.GITHUB_WEBHOOK_SECRET
  const hmac = crypto.createHmac("sha256", secret)
  const digest = `sha256=${hmac.update(payload).digest("hex")}`
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))
}

export async function POST(req: Request) {
  try {
    console.log("GITHUB WEBHOOK!!!!")
    const payload = await req.text()
    const headersList = await headers()
    const signature = headersList.get("x-hub-signature-256")
    console.log("signature", signature)
    // Verify webhook signature
    if (!signature || !verifyGitHubWebhook(payload, signature)) {
      return new Response("Invalid signature", { status: 401 })
    }

    const event = headersList.get("x-github-event")

    // Handle different webhook events
    switch (event) {
      case "installation":
        const webhookData = JSON.parse(payload) as InstallationEvent
        // Handle app installation events
        if (webhookData.action === "created") {
          await prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              githubInstallationId: webhookData.installation.id.toString(),
            },
          })
        } else if (webhookData.action === "deleted") {
          await prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              githubInstallationId: null,
            },
          })
        }
        break

      // Add more event handlers as needed
      default:
        console.log(`Unhandled event type: ${event}`)
    }

    return NextResponse.redirect(new URL("/home", req.url))
  } catch (error) {
    console.error("Webhook error:", error)
    return new Response("Webhook processing failed", { status: 500 })
  }
}
