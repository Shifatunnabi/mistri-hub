import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is admin
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const body = await req.json()
    const { userId, action } = body

    if (!userId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (action !== "ban" && action !== "unban") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    // Find the helper
    const helper = await User.findById(userId)

    if (!helper) {
      return NextResponse.json({ error: "Helper not found" }, { status: 404 })
    }

    if (helper.role !== "HELPER") {
      return NextResponse.json({ error: "User is not a helper" }, { status: 400 })
    }

    // Update ban status
    const isBanned = action === "ban"
    helper.isBanned = isBanned
    await helper.save()

    return NextResponse.json(
      {
        message: `Helper ${action}ned successfully`,
        helper: {
          id: helper._id,
          name: helper.name,
          email: helper.email,
          isBanned: helper.isBanned,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Ban/Unban helper error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
