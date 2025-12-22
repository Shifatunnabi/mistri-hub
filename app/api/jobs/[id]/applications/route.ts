import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Application from "@/models/Application"
import Job from "@/models/Job"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { id: jobId } = await params

    // Check if job exists
    const job = await Job.findById(jobId)
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Check if user is the job owner
    if (job.helpSeeker.toString() !== session.user.id) {
      return NextResponse.json({ error: "Only job owner can view applications" }, { status: 403 })
    }

    // Fetch applications with helper details
    const applications = await Application.find({ job: jobId })
      .populate({
        path: "helper",
        select: "name email phone profilePhoto averageRating totalReviews",
      })
      .sort({ createdAt: -1 })

    return NextResponse.json(
      {
        applications,
        total: applications.length,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
