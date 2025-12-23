import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Job from "@/models/Job"
import Review from "@/models/Review"

export async function GET(request: Request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Count posted jobs by this help seeker
    const postedJobsCount = await Job.countDocuments({ helpSeeker: userId })

    // Count reviews given by this help seeker (they are the reviewer)
    const reviewsGivenCount = await Review.countDocuments({ reviewer: userId })

    return NextResponse.json({
      postedJobsCount,
      reviewsGivenCount,
    })
  } catch (error) {
    console.error("Error fetching help seeker stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
