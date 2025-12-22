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
    const { scheduledDate } = await req.json()

    if (!scheduledDate) {
      return NextResponse.json({ error: "Scheduled date is required" }, { status: 400 })
    }

    const job = await Job.findById(jobId)
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Check if user is the assigned helper
    if (job.assignedHelper?.toString() !== session.user.id) {
      return NextResponse.json({ error: "Only assigned helper can schedule the job" }, { status: 403 })
    }

    // Check if job status is assigned
    if (job.status !== "assigned") {
      return NextResponse.json({ error: "Job must be in assigned status to schedule" }, { status: 400 })
    }

    // Update job
    job.status = "scheduled"
    job.scheduledDate = new Date(scheduledDate)
    await job.save()

    // Notify job seeker about schedule
    await createNotification({
      userId: job.helpSeeker.toString(),
      type: "timeline_update",
      title: "Job Scheduled",
      message: `Your job "${job.title}" has been scheduled for ${new Date(scheduledDate).toLocaleDateString()}.`,
      jobId: jobId,
      link: `/jobs/${jobId}/timeline`,
    })

    return NextResponse.json(
      {
        message: "Job scheduled successfully",
        job,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error scheduling job:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
