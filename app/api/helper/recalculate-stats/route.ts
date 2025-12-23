import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import Job from "@/models/Job"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const user = await User.findById(session.user.id)
    if (!user || user.role !== "HELPER") {
      return NextResponse.json({ error: "Only helpers can recalculate stats" }, { status: 403 })
    }

    // Count actual completed jobs where this user was the assignedHelper
    const actualCompletedCount = await Job.countDocuments({
      assignedHelper: session.user.id,
      status: "completed",
    })

    // Update the user's completedJobs count
    if (user.helperProfile) {
      user.helperProfile.completedJobs = actualCompletedCount
      await user.save()

      return NextResponse.json(
        {
          message: "Completed jobs count recalculated successfully",
          oldCount: user.helperProfile.completedJobs,
          newCount: actualCompletedCount,
        },
        { status: 200 }
      )
    }

    return NextResponse.json({ error: "Helper profile not found" }, { status: 404 })
  } catch (error) {
    console.error("Error recalculating completed jobs:", error)
    return NextResponse.json(
      { error: "Failed to recalculate completed jobs" },
      { status: 500 }
    )
  }
}
