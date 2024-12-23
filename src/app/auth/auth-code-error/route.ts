import { NextResponse } from "next/server"

interface AuthErrorParams {
  error: string
  error_code: string
  error_description: string
}

export async function GET(request: Request) {
  try {
    // Get the full URL including the hash
    const url = new URL(request.url)
    const hash = url.hash.substring(1) // Remove the # character

    // First create the generic object
    const rawParams = Object.fromEntries(new URLSearchParams(hash).entries())

    // Validate that all required fields exist
    if (
      !rawParams.error ||
      !rawParams.error_code ||
      !rawParams.error_description
    ) {
      throw new Error("Missing required error parameters")
    }

    // Now we can safely cast to AuthErrorParams
    const params: AuthErrorParams = {
      error: rawParams.error,
      error_code: rawParams.error_code,
      error_description: rawParams.error_description,
    }

    // Return structured error response
    return NextResponse.json(
      {
        error: params.error,
        errorCode: params.error_code,
        description: decodeURIComponent(params.error_description),
      },
      {
        status: 400,
      }
    )
  } catch (error) {
    return NextResponse.json(
      {
        error: "invalid_request",
        description: "Unable to parse error parameters",
      },
      {
        status: 400,
      }
    )
  }
}
