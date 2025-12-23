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

    // Find the help seeker
    const helpSeeker = await User.findById(userId)

    if (!helpSeeker) {
      return NextResponse.json({ error: "Help seeker not found" }, { status: 404 })
    }

    if (helpSeeker.role !== "HELP_SEEKER") {
      return NextResponse.json({ error: "User is not a help seeker" }, { status: 400 })
    }

    // Update ban status
    const isBanned = action === "ban"
    helpSeeker.isBanned = isBanned
    await helpSeeker.save()

    return NextResponse.json(
      {
        message: `Help seeker ${action}ned successfully`,
        helpSeeker: {
          id: helpSeeker._id,
          name: helpSeeker.name,
          email: helpSeeker.email,
          isBanned: helpSeeker.isBanned,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Ban/Unban help seeker error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
