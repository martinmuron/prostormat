import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getTopPrioritySoldOut, setTopPrioritySoldOut } from "@/lib/site-settings"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const topPrioritySoldOut = await getTopPrioritySoldOut()

  return NextResponse.json({ topPrioritySoldOut })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    if (typeof body?.topPrioritySoldOut !== "boolean") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    await setTopPrioritySoldOut(body.topPrioritySoldOut)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to update site setting:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
