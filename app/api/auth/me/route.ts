import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
