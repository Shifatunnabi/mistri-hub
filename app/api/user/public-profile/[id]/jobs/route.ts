import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Job from "@/models/Job"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await connectDB()

    // For helpers: show completed jobs where they were the assignedHelper
    // For help seekers: show their posted jobs (all statuses for public view)
    const helpSeeker = await Job.find({ helpSeeker: id })
      .select("title description category status budget location photos createdAt")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean()

    const helper = await Job.find({ 
      assignedHelper: id, 
      status: "completed" 
    })
      .select("title description category status budget location photos createdAt")
      .sort({ completedAt: -1 })
      .limit(20)
      .lean()

    // Return whichever has jobs (or help seeker jobs by default)
    const jobs = helper.length > 0 ? helper : helpSeeker

    return NextResponse.json({ jobs }, { status: 200 })
  } catch (error) {
    console.error("Error fetching public jobs:", error)
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    )
  }
}
