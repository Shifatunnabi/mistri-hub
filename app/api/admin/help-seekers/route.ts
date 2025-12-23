import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import Job from "@/models/Job"
import Review from "@/models/Review"
import Report from "@/models/Report"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is admin
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Fetch all help seekers
    const helpSeekers = await User.find({ role: "HELP_SEEKER" })
      .select("name email phone address profilePhoto isBanned createdAt")
      .sort({ createdAt: -1 })
      .lean()

    // Get stats for each help seeker
    const helpSeekersWithStats = await Promise.all(
      helpSeekers.map(async (hs) => {
        const [postedJobsCount, reviewsGivenCount, reportsCount] = await Promise.all([
          Job.countDocuments({ helpSeeker: hs._id }),
          Review.countDocuments({ reviewer: hs._id }),
          Report.countDocuments({ reportedUser: hs._id }),
        ])

        return {
          ...hs,
          postedJobsCount,
          reviewsGivenCount,
          reportsCount,
        }
      })
    )

    return NextResponse.json(
      {
        helpSeekers: helpSeekersWithStats,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Fetch help seekers error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
