import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import Job from "@/models/Job"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is admin
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Fetch statistics
    const [
      totalUsers,
      activeHelpers,
      completedJobs,
      pendingHelpers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "HELPER", isApproved: true, isBanned: false }),
      Job.countDocuments({ status: "completed" }),
      User.countDocuments({ role: "HELPER", isApproved: false }),
    ])

    return NextResponse.json({
      totalUsers,
      activeHelpers,
      completedJobs,
      pendingHelpers,
    })
  } catch (error) {
    console.error("Fetch admin stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
