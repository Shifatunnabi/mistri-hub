import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Job from "@/models/Job"
import { createNotification } from "@/lib/notifications"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { id: jobId } = await params

    const job = await Job.findById(jobId)
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Check if user is the assigned helper
    if (job.assignedHelper?.toString() !== session.user.id) {
      return NextResponse.json({ error: "Only assigned helper can mark job as complete" }, { status: 403 })
    }

    // Check if job status is in_progress
    if (job.status !== "in_progress") {
      return NextResponse.json({ error: "Job must be in progress to mark as complete" }, { status: 400 })
    }

    // Update job
    job.status = "pending_review"
    job.completedAt = new Date()
    await job.save()

    // Populate helper and seeker data before returning
    await job.populate([
      { path: "helpSeeker", select: "name email profilePhoto phone" },
      { path: "assignedHelper", select: "name email profilePhoto phone averageRating isVerified" }
    ])

    // Notify job seeker to review and confirm completion
    await createNotification({
      userId: job.helpSeeker._id.toString(),
      type: "timeline_update",
      title: "Job Marked Complete",
      message: `The helper has marked your job "${job.title}" as complete. Please check the timeline and mark the job as completed if you're satisfied with the work.`,
      jobId: jobId,
      link: `/jobs/${jobId}/timeline`,
    })

    return NextResponse.json(
      {
        message: "Job marked as complete. Waiting for seeker confirmation.",
        job,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error completing job:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
