import { NextResponse } from "next/server"
import { createGithubInstallation } from "@actions/github"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    // Parse the URL parameters
    const { searchParams } = new URL(request.url)
    const installationId = searchParams.get("installation_id")
    const setupAction = searchParams.get("setup_action")

    if (!installationId || setupAction !== "install") {
      return new NextResponse("Invalid installation parameters", {
        status: 400,
      })
    }

    // Create the installation record in the database
    await createGithubInstallation({
      installationId: parseInt(installationId),
    })

    // Redirect to the success page or dashboard
    // return NextResponse.redirect(new URL("/home/dashboard", request.url))
    return NextResponse.redirect(new URL("/home", request.url))
  } catch (error) {
    console.error("GitHub installation error:", error)
    return new NextResponse("Installation failed", { status: 500 })
  }
}
